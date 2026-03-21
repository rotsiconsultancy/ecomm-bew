import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getUserPointsBalance, getPendingRedemption } from '@/lib/points'
import type {
  CheckoutConfig,
  CompanionProduct,
  InfluenceConfig,
  PaymentMethod,
  PostPurchasePrompt,
  UserCheckoutData,
  UserTier,
} from '@/types/checkout'
import { DEFAULT_CHECKOUT_CONFIG } from '@/types/checkout'

// ─── Checkout config ─────────────────────────────────────────────────────────

export async function getCheckoutConfig(): Promise<CheckoutConfig> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('checkout_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  return (data as CheckoutConfig) ?? DEFAULT_CHECKOUT_CONFIG
}

// ─── Payment methods ─────────────────────────────────────────────────────────

export async function getActivePaymentMethods(
  userTier: UserTier,
  orderTotal: number
): Promise<PaymentMethod[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (!data) return []

  return (data as PaymentMethod[]).filter((m) => {
    if (orderTotal < m.min_order_amount) return false
    const tiers = Array.isArray(m.allowed_tiers) ? m.allowed_tiers : []
    if (tiers.length > 0 && !tiers.includes(userTier)) return false
    return true
  })
}

// ─── Companion products ──────────────────────────────────────────────────────

export async function getCompanionProducts(
  cartProductIds: string[],
  _userId: string
): Promise<CompanionProduct[]> {
  if (cartProductIds.length === 0) return []

  const supabase = await createClient()

  // 1. Check product-level overrides first
  const { data: overrides } = await supabase
    .from('product_companions')
    .select('companion_product_id, sort_order')
    .in('product_id', cartProductIds)
    .order('sort_order')

  if (overrides && overrides.length > 0) {
    const companionIds = overrides
      .map((o) => o.companion_product_id)
      .filter((id) => !cartProductIds.includes(id))

    if (companionIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, slug, price, currency, stock, orders_last_30_days, images, category')
        .in('id', companionIds)
        .eq('is_active', true)

      if (products && products.length > 0) {
        return products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          currency: p.currency,
          stock: p.stock,
          orders_last_30_days: p.orders_last_30_days ?? 0,
          image: p.images?.[0] ?? null,
          category: p.category,
          reason_copy: '',
          points_multiplier: 2.0,
        }))
      }
    }
  }

  // 2. Fallback to category rules
  const { data: cartProducts } = await supabase
    .from('products')
    .select('category')
    .in('id', cartProductIds)

  const cartCategories = [...new Set(
    (cartProducts ?? []).map((p) => p.category).filter(Boolean) as string[]
  )]

  if (cartCategories.length === 0) return []

  const { data: rules } = await supabase
    .from('companion_rules')
    .select('*')
    .in('source_category', cartCategories)
    .eq('is_active', true)

  if (!rules || rules.length === 0) return []

  const targetCategories = [...new Set(rules.map((r) => r.target_category))]

  const { data: companionProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, currency, stock, orders_last_30_days, images, category')
    .in('category', targetCategories)
    .eq('is_active', true)
    .not('id', 'in', `(${cartProductIds.join(',')})`)
    .limit(10)

  if (!companionProducts) return []

  // Map products with their rule data
  const ruleMap = new Map(rules.map((r) => [r.target_category, r]))

  return companionProducts.map((p) => {
    const rule = ruleMap.get(p.category ?? '')
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      currency: p.currency,
      stock: p.stock,
      orders_last_30_days: p.orders_last_30_days ?? 0,
      image: p.images?.[0] ?? null,
      category: p.category,
      reason_copy: rule?.reason_copy ?? '',
      points_multiplier: Number(rule?.points_multiplier ?? 2.0),
    }
  })
}

// ─── Influence mode ──────────────────────────────────────────────────────────

export async function getInfluenceMode(
  userId: string,
  userTier: UserTier
): Promise<InfluenceConfig> {
  const supabase = await createClient()

  const [configRes, profileRes] = await Promise.all([
    supabase.from('checkout_config').select('*').eq('id', 1).maybeSingle(),
    supabase.from('profiles').select('influence_mode_enabled').eq('id', userId).maybeSingle(),
  ])

  const config = (configRes.data as CheckoutConfig) ?? DEFAULT_CHECKOUT_CONFIG
  const userOverride = profileRes.data?.influence_mode_enabled as boolean | null

  // Determine if influence is enabled
  let enabled: boolean
  if (userOverride !== null && userOverride !== undefined) {
    enabled = userOverride
  } else {
    enabled = userTier === 'wholesale'
      ? config.influence_default_wholesale
      : config.influence_default_retail
  }

  return {
    enabled,
    intensity: config.influence_intensity,
    show_companions: config.show_companions,
    show_scarcity: config.show_scarcity,
    show_social_proof: config.show_social_proof,
    show_points_overlay: config.show_points_overlay,
    show_streak_reminder: config.show_streak_reminder,
    show_bundle_framing: config.show_bundle_framing,
  }
}

// ─── Post-purchase prompts ───────────────────────────────────────────────────

export async function getPostPurchasePrompts(): Promise<PostPurchasePrompt[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('post_purchase_config')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return (data ?? []) as PostPurchasePrompt[]
}

// ─── User checkout data (prefill) ────────────────────────────────────────────

export async function getUserCheckoutData(userId: string): Promise<UserCheckoutData> {
  const supabase = await createClient()

  const [profileRes, lastOrderRes, balance, pending, streakCount] = await Promise.all([
    supabase.from('profiles').select('full_name, phone').eq('id', userId).maybeSingle(),
    supabase
      .from('orders')
      .select('shipping_address')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getUserPointsBalance(userId),
    getPendingRedemption(userId),
    getLoginStreakCount(userId),
  ])

  const profile = profileRes.data
  const { data: userData } = await supabase.auth.getUser()

  return {
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    email: userData.user?.email ?? '',
    company: null,
    last_shipping_address: lastOrderRes.data?.shipping_address as UserCheckoutData['last_shipping_address'] ?? null,
    points_balance: balance,
    pending_redemption: pending,
    streak_count: streakCount,
  }
}

// ─── Helper: count consecutive daily login streak ────────────────────────────

async function getLoginStreakCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data: claims } = await supabase
    .from('points_claims')
    .select('reference_id')
    .eq('user_id', userId)
    .eq('action_key', 'daily_login')
    .order('claimed_at', { ascending: false })
    .limit(30)

  if (!claims || claims.length === 0) return 0

  const dates = new Set(claims.map((c) => c.reference_id))
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    if (dates.has(dateStr)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// ─── Update user influence preference ────────────────────────────────────────

export async function updateInfluencePreference(
  userId: string,
  enabled: boolean
): Promise<void> {
  const supabase = await createServiceClient()
  await supabase
    .from('profiles')
    .update({ influence_mode_enabled: enabled })
    .eq('id', userId)
}

// ─── Get delivery fee from settings ──────────────────────────────────────────

export async function getDeliveryFee(): Promise<number> {
  // Read from logistics settings, fallback to 500
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'logistics')
    .maybeSingle()

  const logistics = data?.value as { truck_delivery?: { base_fee?: number } } | null
  return logistics?.truck_delivery?.base_fee || 500
}
