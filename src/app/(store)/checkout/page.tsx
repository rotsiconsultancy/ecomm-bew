import type { Metadata } from 'next'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  getCheckoutConfig,
  getActivePaymentMethods,
  getCompanionProducts,
  getInfluenceMode,
  getPostPurchasePrompts,
  getUserCheckoutData,
  getDeliveryFee,
} from '@/lib/checkout'
import { getPointsConfig } from '@/lib/points'
import { CheckoutProvider } from './checkout-context'
import { CheckoutFlow } from './checkout-flow'
import { CheckoutAuthModal } from './checkout-auth-modal'
import type { UserTier } from '@/types/checkout'

export const metadata: Metadata = {
  title: 'Checkout | Bewama',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const user = await getUser()
  if (!user) return <CheckoutAuthModal />

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const userTier = (profile?.role ?? 'customer') as UserTier

  // Fetch cart from DB to get product IDs for companion lookup
  const { data: cartRow } = await supabase
    .from('carts')
    .select('items')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const cartProductIds: string[] = Array.isArray(cartRow?.items)
    ? (cartRow.items as { product_id: string }[]).map((i) => i.product_id)
    : []

  // Estimate order total from cart items for payment method filtering
  const cartItems = Array.isArray(cartRow?.items) ? (cartRow.items as { price: number; quantity: number }[]) : []
  const estimatedTotal = cartItems.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0)

  // Parallel data fetch
  const [
    userCheckout,
    influenceConfig,
    companions,
    paymentMethods,
    postPurchasePrompts,
    deliveryFee,
    pointsConfig,
  ] = await Promise.all([
    getUserCheckoutData(user.id),
    getInfluenceMode(user.id, userTier),
    getCompanionProducts(cartProductIds, user.id),
    getActivePaymentMethods(userTier, estimatedTotal),
    getPostPurchasePrompts(),
    getDeliveryFee(),
    getPointsConfig(),
  ])

  // Get earn rate: points per KES 50 from purchase config
  const purchaseConfig = pointsConfig.find((c) => c.action_key === 'purchase')
  const earnRate = purchaseConfig?.points_value ?? 1

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <CheckoutProvider
        cartItems={[]} // Client-side cart state is canonical — passed as empty, flow reads from useCart()
        cartTotal={0}
        userCheckout={userCheckout}
        influenceConfig={influenceConfig}
        companions={companions}
        paymentMethods={paymentMethods}
        postPurchasePrompts={postPurchasePrompts}
        deliveryFee={deliveryFee}
        earnRate={earnRate}
      >
        <CheckoutFlow />
      </CheckoutProvider>
    </div>
  )
}
