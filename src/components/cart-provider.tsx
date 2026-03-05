'use client'

import { useReducer, useMemo } from 'react'
import { CartContext, cartReducer, CartItem } from '@/lib/cart-store'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const value = useMemo(
    () => ({
      cartItems: state.items,
      cartCount,
      cartTotal,
      addToCart: (item: CartItem) => dispatch({ type: 'ADD_ITEM', item }),
      removeFromCart: (product_id: string) => dispatch({ type: 'REMOVE_ITEM', product_id }),
      updateQuantity: (product_id: string, quantity: number) =>
        dispatch({ type: 'UPDATE_QUANTITY', product_id, quantity }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    }),
    [state.items, cartCount, cartTotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
