'use client'

import { useReducer, useMemo, useEffect, useRef, useCallback } from 'react'
import { CartContext, cartReducer, CartItem, CartAction } from '@/lib/cart-store'
import { createClient } from '@/lib/supabase/client'

const SESSION_KEY = 'bewama_cart_session'
const LEGACY_CART_STORAGE_KEY = 'bewama_cart_items'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const cartDbId  = useRef<string | null>(null)
  const lastSaved = useRef<string>('[]')
  const hydrated  = useRef(false) // guard against StrictMode double-run
  const currentItems = useRef<CartItem[]>([])
  const ready = useRef(false)
  const changedBeforeReady = useRef(false)
  const writeQueue = useRef<Promise<void>>(Promise.resolve())

  const syncToDb = useCallback(async (items: CartItem[]) => {
    const serialized = JSON.stringify(items)
    if (serialized === lastSaved.current) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const sessionId = getOrCreateSessionId()
    const now = new Date().toISOString()

    if (cartDbId.current) {
      const { error } = await supabase
        .from('carts')
        .update({ items, updated_at: now })
        .eq('id', cartDbId.current)
      if (error) throw error
    } else if (items.length > 0) {
      const { data, error } = await supabase
        .from('carts')
        .insert({
          items,
          status:     'active',
          user_id:    user?.id ?? null,
          session_id: user ? null : sessionId,
          updated_at: now,
        })
        .select('id')
        .maybeSingle()
      if (error) throw error
      if (data?.id) cartDbId.current = data.id
    }

    lastSaved.current = serialized
  }, [])

  const queueDbSync = useCallback((items: CartItem[]) => {
    const snapshot = [...items]
    writeQueue.current = writeQueue.current
      .then(() => syncToDb(snapshot))
      .catch((error) => {
        console.error('Failed to sync cart', error)
      })
  }, [syncToDb])

  const commitCartAction = useCallback((action: CartAction) => {
    const nextState = cartReducer({ items: currentItems.current }, action)
    currentItems.current = nextState.items
    dispatch({ type: 'SET_ITEMS', items: nextState.items })

    if (ready.current) {
      queueDbSync(nextState.items)
    } else {
      changedBeforeReady.current = true
    }
  }, [queueDbSync])

  // ── Hydrate cart contents from DB; client only stores the guest session id ─
  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    async function init() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const sessionId = getOrCreateSessionId()

      const base = supabase
        .from('carts')
        .select('id, items')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)

      const { data } = user
        ? await base.eq('user_id', user.id).maybeSingle()
        : await base.eq('session_id', sessionId).is('user_id', null).maybeSingle()

      if (data) {
        cartDbId.current  = data.id
        const dbItems = (data.items ?? []) as CartItem[]
        lastSaved.current = JSON.stringify(dbItems)
        if (!changedBeforeReady.current) {
          currentItems.current = dbItems
          dispatch({ type: 'SET_ITEMS', items: dbItems })
        }
      }

      ready.current = true
      if (changedBeforeReady.current) {
        queueDbSync(currentItems.current)
      }
    }

    init()
  }, [queueDbSync])

  // ── clearCart marks DB row as 'converted' ────────────────────────────────
  const clearCart = useCallback(() => {
    currentItems.current = []
    dispatch({ type: 'CLEAR_CART' })
    if (cartDbId.current) {
      const supabase = createClient()
      void supabase
        .from('carts')
        .update({ status: 'converted', updated_at: new Date().toISOString() })
        .eq('id', cartDbId.current)
      cartDbId.current  = null
      lastSaved.current = '[]'
    }
  }, [])

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const value = useMemo(
    () => ({
      cartItems: state.items,
      cartCount,
      cartTotal,
      addToCart:      (item: CartItem) => commitCartAction({ type: 'ADD_ITEM', item }),
      removeFromCart: (product_id: string) => commitCartAction({ type: 'REMOVE_ITEM', product_id }),
      updateQuantity: (product_id: string, quantity: number) =>
        commitCartAction({ type: 'UPDATE_QUANTITY', product_id, quantity }),
      clearCart,
    }),
    [state.items, cartCount, cartTotal, commitCartAction, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
