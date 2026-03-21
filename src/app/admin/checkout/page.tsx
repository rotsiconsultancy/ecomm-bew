import { getAdminContext } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { getAllSettings } from '@/lib/settings'
import type { CheckoutConfig, PaymentMethod, PostPurchasePrompt, CompanionRule } from '@/types/checkout'
import { DEFAULT_CHECKOUT_CONFIG } from '@/types/checkout'
import { CheckoutAdminTabs } from './checkout-admin-tabs'

export default async function AdminCheckoutPage() {
  await getAdminContext()

  const supabase = await createServiceClient()

  const [configRes, methodsRes, promptsRes, rulesRes, categoriesRes, settings] = await Promise.all([
    supabase.from('checkout_config').select('*').eq('id', 1).maybeSingle(),
    supabase.from('payment_methods').select('*').order('sort_order'),
    supabase.from('post_purchase_config').select('*').order('sort_order'),
    supabase.from('companion_rules').select('*').order('created_at'),
    supabase.from('products').select('category').not('category', 'is', null),
    getAllSettings(),
  ])

  const config = (configRes.data as CheckoutConfig) ?? DEFAULT_CHECKOUT_CONFIG
  const methods = (methodsRes.data ?? []) as PaymentMethod[]
  const prompts = (promptsRes.data ?? []) as PostPurchasePrompt[]
  const rules = (rulesRes.data ?? []) as CompanionRule[]
  const categories = [...new Set((categoriesRes.data ?? []).map((p) => p.category as string).filter(Boolean))]

  // Build credentials status: does each payment method have actual credentials configured?
  const creds = settings.credentials
  const credentialsStatus: Record<string, boolean> = {
    mpesa:   !!(creds.rotsi.consumer_key && creds.rotsi.consumer_secret && creds.rotsi.shortcode),
    card:    !!(creds.cards.api_key && creds.cards.provider),
    cod:     true, // COD never needs credentials
    account: true, // Account billing is internal
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Checkout Configuration</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure influence mode, payment methods, post-purchase prompts, and companion rules.
        </p>
      </div>

      <CheckoutAdminTabs
        config={config}
        methods={methods}
        prompts={prompts}
        rules={rules}
        categories={categories}
        credentialsStatus={credentialsStatus}
      />
    </div>
  )
}
