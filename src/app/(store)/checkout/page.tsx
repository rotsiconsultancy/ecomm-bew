import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, FileText, LockKeyhole, ShoppingCart, UserRound } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Checkout | Bewama',
  robots: { index: false, follow: false },
}
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
import type { UserTier } from '@/types/checkout'

export default async function CheckoutPage() {
  const user = await getUser()
  if (!user) return <CheckoutAuthPrompt />

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

function CheckoutAuthPrompt() {
  return (
    <section className="relative isolate min-h-[76vh] overflow-hidden bg-[#03152d] px-4 py-14 text-white sm:px-6 lg:px-8">
      <Image
        src="/bewama/trade-strip.png"
        alt="Bewama construction materials"
        fill
        className="absolute inset-0 -z-20 object-cover opacity-35"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-[#03152d]/88" />

      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Secure checkout</p>
          <h1 className="text-4xl font-black leading-tight sm:text-6xl">
            Sign in to finish checkout.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-white/70">
            Bewama keeps checkout tied to your account so delivery details, invoices, order history,
            and follow-up support stay organized.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/20 bg-white p-5 text-[#182333] shadow-2xl shadow-black/25 sm:p-7">
          <div className="mb-5 flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff1e8] text-[#ff5f14]">
              <LockKeyhole className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black leading-tight text-[#061f3f]">Continue securely</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-[#4b5a6a]">
                Sign in, create an account, or move the order into RFQ if this purchase needs review.
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {['Saved delivery', 'Order history', 'Invoice support'].map((pill) => (
              <span key={pill} className="rounded-full border border-[#d8e0ea] bg-[#f4f7fa] px-3 py-1 text-xs font-black text-[#061f3f]">
                {pill}
              </span>
            ))}
          </div>

          <div className="grid gap-3">
            <Link href="/login?redirectTo=/checkout" className="group flex min-h-14 items-center justify-between rounded-lg bg-[#ff5f14] px-4 font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#e84f0a]">
              <span className="inline-flex items-center gap-2"><UserRound className="h-5 w-5" /> Sign in to checkout</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/request-quote" className="flex min-h-14 items-center justify-between rounded-lg border border-[#d8e0ea] bg-white px-4 font-black text-[#061f3f] transition-colors hover:border-[#ff5f14] hover:bg-[#fff8f4]">
              <span className="inline-flex items-center gap-2"><FileText className="h-5 w-5" /> Request quote instead</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/products" className="flex min-h-14 items-center justify-between rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] px-4 font-black text-[#061f3f] transition-colors hover:border-[#061f3f]/40">
              <span className="inline-flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Keep browsing</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
