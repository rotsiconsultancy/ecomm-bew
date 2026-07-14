'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Truck, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCheckout } from '../checkout-context'
import { useCart } from '@/lib/cart-store'
import { createOrder, previewSupplierCheckout } from '../actions'
import { POINTS_TO_KES } from '@/types/points'
import type { CheckoutFulfilmentGroup } from '@/lib/suppliers'

type PreviewState = {
  eligible: CheckoutFulfilmentGroup[]
  support: CheckoutFulfilmentGroup[]
  eligibleSubtotal: number
  eligibleDeliveryTotal: number
  supportSubtotal: number
}

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
  const [isPreviewPending, startPreviewTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [itemsExpanded, setItemsExpanded] = useState(false)
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const checkoutItems = useMemo(() => cartItems.map((i) => ({
    product_id: i.product_id,
    name: i.name,
    slug: i.slug,
    price: i.price,
    currency: i.currency,
    quantity: i.quantity,
    image: i.image,
  })), [cartItems])

  useEffect(() => {
    startPreviewTransition(async () => {
      const result = await previewSupplierCheckout(checkoutItems, state.delivery.delivery_region_id)
      if (result.success && 'eligible' in result) {
        setPreview({
          eligible: result.eligible,
          support: result.support,
          eligibleSubtotal: result.eligibleSubtotal,
          eligibleDeliveryTotal: result.eligibleDeliveryTotal,
          supportSubtotal: result.supportSubtotal,
        })
      } else {
        setPreview(null)
      }
    })
  }, [checkoutItems, state.delivery.delivery_region_id])

  const eligibleSubtotal = preview?.eligibleSubtotal ?? cartTotal
  const supportSubtotal = preview?.supportSubtotal ?? 0
  const checkoutDeliveryFee = preview?.eligibleDeliveryTotal ?? deliveryFee
  const canPayNow = eligibleSubtotal > 0
  const hasSupportItems = (preview?.support.length ?? 0) > 0
  const subtotal = eligibleSubtotal
  const pendingPts = userCheckout.pending_redemption
  const pointsDiscount = state.pointsRedeemApplied
    ? Math.min(pendingPts * POINTS_TO_KES, subtotal + checkoutDeliveryFee)
    : 0
  const total = subtotal + checkoutDeliveryFee - pointsDiscount
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
        slug: i.slug,
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
        delivery_region_id: state.delivery.delivery_region_id,
      },
      total
    )

    if (!result.success) {
      setError(result.error ?? 'Failed to place order. Please try again.')
      setLoading(false)
      return
    }

    clearCart()
    if (result.supportOnly && result.supportQuoteIds?.[0]) {
      router.push(`/quote-submitted?id=${result.supportQuoteIds[0]}`)
      return
    }
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
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} — KES {cartTotal.toLocaleString()}
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

      {(preview || isPreviewPending) && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ready for payment</p>
                <p className="font-extrabold text-[#061f3f]">
                  {isPreviewPending ? 'Checking delivery...' : `KES ${(eligibleSubtotal + checkoutDeliveryFee).toLocaleString()}`}
                </p>
              </div>
            </div>
            {preview?.eligible.map((group) => (
              <div key={group.key} className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-[#061f3f]">{group.owner === 'bewama' ? 'Bewama fulfilment' : 'Supplier fulfilment'}</span>
                  <span className="font-bold text-[#061f3f]">KES {(group.subtotal + group.delivery_fee).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {group.items.length} item{group.items.length !== 1 ? 's' : ''} · Delivery KES {group.delivery_fee.toLocaleString()}
                  {group.lead_time_min_days !== null && group.lead_time_max_days !== null
                    ? ` · ${group.lead_time_min_days}-${group.lead_time_max_days} days`
                    : ''}
                </p>
              </div>
            ))}
          </div>

          {hasSupportItems && (
            <div className="bg-amber-50 rounded-2xl p-5 shadow-sm border border-amber-200 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Needs delivery support</p>
                  <p className="text-sm text-amber-900">
                    Some items need delivery support. You can pay for available items now, and we&apos;ll connect you with a dedicated agent for the remaining items.
                  </p>
                </div>
              </div>
              {preview?.support.map((group) => (
                <div key={group.key} className="rounded-xl bg-white/75 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-[#061f3f]">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
                    <span className="font-bold text-[#061f3f]">KES {group.subtotal.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-800">{group.support_reason ?? 'Delivery support required.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
          <span className="font-bold text-[#061f3f]">KES {checkoutDeliveryFee.toLocaleString()}</span>
        </div>
        {supportSubtotal > 0 && (
          <div className="flex justify-between text-amber-700">
            <span>Moved to support</span>
            <span className="font-bold">KES {supportSubtotal.toLocaleString()}</span>
          </div>
        )}
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
        disabled={loading || isPreviewPending || (!canPayNow && !hasSupportItems)}
        className="w-full h-16 bg-[#061f3f] hover:bg-[#03152d] text-white text-lg font-extrabold rounded-2xl shadow-xl active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : !canPayNow && hasSupportItems ? (
          'Request delivery support'
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
