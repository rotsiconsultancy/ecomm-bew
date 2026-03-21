'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCheckout } from './checkout-context'
import { useCart } from '@/lib/cart-store'
import { StageCart } from './stages/stage-cart'
import { StageDelivery } from './stages/stage-delivery'
import { StageInfluence } from './stages/stage-influence'
import { StagePayment } from './stages/stage-payment'
import { StageConfirm } from './stages/stage-confirm'

const STAGE_LABELS = ['Cart', 'Delivery', 'Deals', 'Payment', 'Confirm']

export function CheckoutFlow() {
  const router = useRouter()
  const { stage, goBack } = useCheckout()
  const { cartItems } = useCart()

  // Redirect if empty cart (but not if on stage 6 — post-purchase)
  useEffect(() => {
    if (cartItems.length === 0 && stage < 6) {
      router.replace('/products')
    }
  }, [cartItems.length, stage, router])

  if (cartItems.length === 0 && stage < 6) return null

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Progress dots */}
      {stage <= 5 && (
        <div className="flex items-center justify-center gap-3 py-6">
          {STAGE_LABELS.map((label, i) => {
            const num = i + 1
            const isCurrent = num === stage
            const isCompleted = num < stage
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#ec5b13] scale-125 ring-4 ring-[#ec5b13]/20'
                        : isCompleted
                          ? 'bg-[#003366]'
                          : 'bg-gray-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-[#ec5b13]'
                        : isCompleted
                          ? 'text-[#003366]'
                          : 'text-gray-300'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STAGE_LABELS.length - 1 && (
                  <div
                    className={`w-8 sm:w-14 h-0.5 -mt-4 transition-colors duration-300 ${
                      num < stage ? 'bg-[#003366]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Back button */}
      {stage > 1 && stage <= 5 && (
        <button
          onClick={goBack}
          className="self-start text-sm font-bold text-gray-400 hover:text-[#003366] transition-colors mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Stage content with animation */}
      <div className="flex-1 relative">
        <div
          key={stage}
          className="animate-in fade-in slide-in-from-right-4 duration-300"
        >
          {stage === 1 && <StageCart />}
          {stage === 2 && <StageDelivery />}
          {stage === 3 && <StageInfluence />}
          {stage === 4 && <StagePayment />}
          {stage === 5 && <StageConfirm />}
        </div>
      </div>
    </div>
  )
}
