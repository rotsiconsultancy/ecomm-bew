'use client'

import { useReducer, useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { CartContext, cartReducer, CartItem } from '@/lib/cart-store'
import { createClient } from '@/lib/supabase/client'

const SESSION_KEY = 'bewama_cart_session'

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
  const [ready, setReady] = useState(false)       // true after DB hydration completes
  const cartDbId  = useRef<string | null>(null)   // ID of the row in `carts`
  const lastSaved = useRef<string>('[]')          // serialized items last written to DB
  const syncTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // ── Hydrate from DB on mount ─────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()

    async function init() {
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
        const items = (data.items ?? []) as CartItem[]
        lastSaved.current = JSON.stringify(items)  // so first sync is skipped
        items.forEach((item) => dispatch({ type: 'ADD_ITEM', item }))
      }

      setReady(true)
    }

    init()
  }, [])

  // ── Sync to DB (debounced 1.2s, skip if data unchanged) ─────────────────
  const syncToDb = useCallback(async (items: CartItem[]) => {
    const serialized = JSON.stringify(items)
    if (serialized === lastSaved.current) return   // nothing changed
    lastSaved.current = serialized

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const sessionId = getOrCreateSessionId()
    const now = new Date().toISOString()

    if (cartDbId.current) {
      await supabase
        .from('carts')
        .update({ items, updated_at: now })
        .eq('id', cartDbId.current)
    } else {
      const { data } = await supabase
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
      if (data?.id) cartDbId.current = data.id
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => syncToDb(state.items), 1200)
    return () => clearTimeout(syncTimer.current)
  }, [state.items, ready, syncToDb])

  // ── clearCart marks DB row as 'converted' ────────────────────────────────
  const clearCart = useCallback(() => {
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
      addToCart:      (item: CartItem) => dispatch({ type: 'ADD_ITEM', item }),
      removeFromCart: (product_id: string) => dispatch({ type: 'REMOVE_ITEM', product_id }),
      updateQuantity: (product_id: string, quantity: number) =>
        dispatch({ type: 'UPDATE_QUANTITY', product_id, quantity }),
      clearCart,
    }),
    [state.items, cartCount, cartTotal, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
