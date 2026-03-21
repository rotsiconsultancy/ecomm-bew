'use client'

import Image from 'next/image'
import { Package, Star, Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCheckout } from '../checkout-context'
import { useCart } from '@/lib/cart-store'
import { POINTS_TO_KES } from '@/types/points'

export function StageCart() {
  const {
    goNext,
    deliveryFee,
    earnRate,
    userCheckout,
    setPointsApplied,
    state,
  } = useCheckout()
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart()

  const subtotal = cartTotal
  const pointsEarned = Math.floor(subtotal / 50) * earnRate
  const pointsKesValue = (pointsEarned * POINTS_TO_KES).toFixed(2)

  const pendingPts = userCheckout.pending_redemption
  const pendingDiscount = pendingPts * POINTS_TO_KES
  const applyPoints = state.pointsRedeemApplied && pendingPts > 0
  const discount = applyPoints ? Math.min(pendingDiscount, subtotal + deliveryFee) : 0
  const total = subtotal + deliveryFee - discount

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="h-20 w-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-gray-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#003366] text-sm line-clamp-2">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                KES {item.price.toLocaleString()} each
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-[#003366] w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="ml-auto h-7 w-7 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors group"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-base font-extrabold text-[#003366] shrink-0">
              KES {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 space-y-3 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span className="font-bold text-[#003366]">KES {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Delivery</span>
          <span className="font-bold text-[#003366]">KES {deliveryFee.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Points discount ({pendingPts.toLocaleString()} pts)</span>
            <span className="font-bold">
              -KES {discount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
        <div className="flex justify-between text-lg font-extrabold text-[#003366] pt-3 border-t">
          <span>Total</span>
          <span>KES {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Points earned card */}
      {pointsEarned > 0 && (
        <div className="bg-linear-to-r from-[#003366] to-[#004a8f] rounded-2xl p-4 sm:p-5 text-white flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-[#ec5b13]" />
          </div>
          <div>
            <p className="font-bold">
              This order earns you {pointsEarned.toLocaleString()} points
            </p>
            <p className="text-sm text-white/60">
              Worth KES {pointsKesValue} in future discounts
            </p>
          </div>
        </div>
      )}

      {/* Pending redemption toggle */}
      {pendingPts > 0 && (
        <button
          onClick={() => setPointsApplied(!state.pointsRedeemApplied)}
          className={`w-full rounded-2xl p-4 flex items-center gap-4 border-2 transition-all ${
            applyPoints
              ? 'border-green-400 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div
            className={`h-6 w-11 rounded-full relative transition-colors shrink-0 ${
              applyPoints ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                applyPoints ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm text-[#003366]">
              Apply {pendingPts.toLocaleString()} points
            </p>
            <p className="text-xs text-gray-400">
              Save KES {pendingDiscount.toFixed(2)} on this order
            </p>
          </div>
        </button>
      )}

      {/* Continue CTA */}
      <Button
        onClick={goNext}
        className="w-full h-14 bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-lg font-extrabold rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
      >
        Continue
      </Button>
    </div>
  )
}
