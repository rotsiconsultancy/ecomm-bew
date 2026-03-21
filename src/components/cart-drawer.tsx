'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Minus, Plus, Trash2, Package } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-store'

export function CartDrawer() {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative p-2 rounded-lg text-gray-600 hover:text-[#003366] hover:bg-gray-100 transition-colors"
          aria-label="Open cart"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ec5b13] text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-105 flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-[#003366] font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add products to get started</p>
            </div>
            <SheetTrigger asChild>
              <Link href="/products">
                <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                  Browse Products
                </Button>
              </Link>
            </SheetTrigger>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="h-16 w-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-semibold text-sm text-[#003366] hover:text-[#ec5b13] line-clamp-2 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold text-[#003366] mt-1">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold border-x border-gray-200 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                <span className="text-lg font-extrabold text-[#003366]">
                  KES {cartTotal.toLocaleString()}
                </span>
              </div>

              <SheetTrigger asChild>
                <Link href="/checkout" className="block">
                  <Button className="w-full h-12 bg-[#003366] hover:bg-[#002244] text-white font-bold text-base">
                    Proceed to Checkout
                  </Button>
                </Link>
              </SheetTrigger>

              <SheetTrigger asChild>
                <button className="w-full text-sm text-gray-500 hover:text-[#003366] transition-colors">
                  Continue Shopping
                </button>
              </SheetTrigger>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
