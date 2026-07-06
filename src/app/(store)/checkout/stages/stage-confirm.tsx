'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, Truck, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCheckout } from '../checkout-context'
import { useCart } from '@/lib/cart-store'
import { createOrder } from '../actions'
import { POINTS_TO_KES } from '@/types/points'

export function StageConfirm() {
  const router = useRouter()
  const {
    state,
    userCheckout,
    paymentMethods,
    deliveryFee,
    earnRate,
    setOrderId,
  } = useCheckout()
  const { cartItems, cartTotal, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [itemsExpanded, setItemsExpanded] = useState(false)

  const subtotal = cartTotal
  const pendingPts = userCheckout.pending_redemption
  const pointsDiscount = state.pointsRedeemApplied
    ? Math.min(pendingPts * POINTS_TO_KES, subtotal + deliveryFee)
    : 0
  const total = subtotal + deliveryFee - pointsDiscount
  const pointsEarned = Math.floor(subtotal / 50) * earnRate

  const selectedMethod = paymentMethods.find(
    (m) => m.method_key === state.selectedPayment
  )

  async function handlePlaceOrder() {
    setLoading(true)
    setError(null)

    const result = await createOrder(
      userCheckout.email ? '' : '', // userId is handled server-side
      cartItems.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        currency: i.currency,
        quantity: i.quantity,
        image: i.image,
      })),
      {
        full_name: state.delivery.full_name,
        phone: state.delivery.phone,
        email: userCheckout.email,
        delivery_address: [state.delivery.street, state.delivery.town, state.delivery.county]
          .filter(Boolean)
          .join(', '),
        city: state.delivery.county,
        notes: '',
      },
      total
    )

    if (!result.success) {
      setError(result.error ?? 'Failed to place order. Please try again.')
      setLoading(false)
      return
    }

    clearCart()
    if (result.id) {
      setOrderId(result.id)
      router.push(`/checkout/success/${result.id}`)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-[#061f3f]">Review your order</h2>
      </div>

      {/* Items (collapsible) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setItemsExpanded(!itemsExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <span className="font-bold text-[#061f3f] text-sm">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} — KES {subtotal.toLocaleString()}
          </span>
          {itemsExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {itemsExpanded && (
          <div className="border-t divide-y divide-gray-50 px-5">
            {cartItems.map((item) => (
              <div key={item.product_id} className="py-3 flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-bold text-[#061f3f]">
                  KES {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery to</p>
        <p className="font-bold text-[#061f3f]">{state.delivery.full_name}</p>
        <p className="text-sm text-gray-500">{state.delivery.phone}</p>
        <p className="text-sm text-gray-500">
          {[state.delivery.street, state.delivery.town, state.delivery.county]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</p>
        <p className="font-bold text-[#061f3f]">
          {selectedMethod?.label ?? state.selectedPayment}
        </p>
      </div>

      {/* Order totals */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span className="font-bold text-[#061f3f]">KES {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Delivery</span>
          <span className="font-bold text-[#061f3f]">KES {deliveryFee.toLocaleString()}</span>
        </div>
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Points discount</span>
            <span className="font-bold">-KES {pointsDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-extrabold text-[#061f3f] pt-2 border-t">
          <span>Total</span>
          <span>KES {total.toLocaleString()}</span>
        </div>
        {pointsEarned > 0 && (
          <p className="text-xs text-[#ff5f14] font-bold pt-1">
            +{pointsEarned.toLocaleString()} points earned with this order
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-5 py-3">
          {error}
        </div>
      )}

      {/* Place order */}
      <Button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full h-16 bg-[#061f3f] hover:bg-[#03152d] text-white text-lg font-extrabold rounded-2xl shadow-xl active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          `Place my order — KES ${total.toLocaleString()}`
        )}
      </Button>

      {/* Reassurance */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          Secure checkout
        </span>
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#061f3f]" />
          Fast delivery
        </span>
      </div>
    </div>
  )
}
