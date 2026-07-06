'use client'

import { Smartphone, CreditCard, Banknote, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCheckout } from '../checkout-context'
import { useCart } from '@/lib/cart-store'
import { POINTS_TO_KES } from '@/types/points'
import type { PaymentMethodKey } from '@/types/checkout'

const METHOD_ICONS: Record<PaymentMethodKey, React.ReactNode> = {
  mpesa: <Smartphone className="w-6 h-6" />,
  card: <CreditCard className="w-6 h-6" />,
  cod: <Banknote className="w-6 h-6" />,
  account: <Building2 className="w-6 h-6" />,
}

const METHOD_DESCRIPTIONS: Record<PaymentMethodKey, string> = {
  mpesa: 'Pay instantly via M-Pesa on your phone',
  card: 'Visa, Mastercard, or American Express',
  cod: 'Pay cash when your order arrives',
  account: 'Bill to your account — pay within 30 days',
}

export function StagePayment() {
  const {
    goNext,
    goTo,
    paymentMethods,
    state,
    setPayment,
    userCheckout,
    deliveryFee,
  } = useCheckout()
  const { cartTotal } = useCart()

  const pendingPts = userCheckout.pending_redemption
  const pointsDiscount = state.pointsRedeemApplied
    ? Math.min(pendingPts * POINTS_TO_KES, cartTotal + deliveryFee)
    : 0

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-[#061f3f]">How would you like to pay?</h2>
        <p className="text-sm text-gray-400">
          Choose your preferred payment method
        </p>
      </div>

      {/* Payment method cards */}
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const isSelected = state.selectedPayment === method.method_key
          return (
            <button
              key={method.id}
              onClick={() => setPayment(method.method_key as PaymentMethodKey)}
              className={`w-full text-left rounded-2xl p-5 flex items-center gap-4 border-2 transition-all ${
                isSelected
                  ? 'border-[#ff5f14] bg-[#ff5f14]/5 shadow-md'
                  : 'border-gray-100 bg-white hover:border-gray-300 shadow-sm'
              }`}
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-[#ff5f14] text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {METHOD_ICONS[method.method_key as PaymentMethodKey] ?? <CreditCard className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${isSelected ? 'text-[#061f3f]' : 'text-gray-700'}`}>
                  {method.label}
                </p>
                <p className="text-xs text-gray-400">
                  {METHOD_DESCRIPTIONS[method.method_key as PaymentMethodKey] ?? ''}
                </p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-[#ff5f14]' : 'border-gray-200'
                }`}
              >
                {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f14]" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Points discount line */}
      {pointsDiscount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-green-700">Points discount applied</p>
            <p className="text-xs text-green-600">
              {pendingPts.toLocaleString()} pts = KES {pointsDiscount.toFixed(2)} off
            </p>
          </div>
          <button
            onClick={() => goTo(1)}
            className="text-xs font-bold text-green-600 hover:underline"
          >
            Adjust
          </button>
        </div>
      )}

      {/* Continue */}
      <Button
        onClick={goNext}
        disabled={!state.selectedPayment}
        className="w-full h-14 bg-[#ff5f14] hover:bg-[#e84f0a] text-white text-lg font-extrabold rounded-2xl shadow-lg disabled:opacity-40"
      >
        Continue
      </Button>
    </div>
  )
}
