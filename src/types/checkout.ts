// ─── Bewama Checkout System Types ─────────────────────────────────────────────

// ─── Database row types ──────────────────────────────────────────────────────

export interface CompanionRule {
  id: string
  source_category: string
  target_category: string
  reason_copy: string
  points_multiplier: number
  display_limit: number
  is_active: boolean
  created_at: string
}

export interface ProductCompanion {
  id: string
  product_id: string
  companion_product_id: string
  sort_order: number
  created_at: string
}

export type InfluenceIntensity = 'low' | 'medium' | 'high'

export interface CheckoutConfig {
  id: number
  influence_default_retail: boolean
  influence_default_wholesale: boolean
  influence_intensity: InfluenceIntensity
  show_companions: boolean
  show_scarcity: boolean
  show_social_proof: boolean
  show_points_overlay: boolean
  show_streak_reminder: boolean
  show_bundle_framing: boolean
  influence_toggle_label: string
  updated_at: string
}

export type TriggerTiming = 'immediate' | 'after_delivery'

export interface PostPurchasePrompt {
  id: string
  prompt_key: string
  is_active: boolean
  points_value: number
  copy_text: string
  trigger_timing: TriggerTiming
  sort_order: number
  created_at: string
}

export type PaymentMethodKey = 'mpesa' | 'card' | 'cod' | 'account'
export type UserTier = 'customer' | 'wholesale' | 'admin' | 'staff' | 'supplier'

export interface PaymentMethod {
  id: string
  method_key: PaymentMethodKey
  label: string
  is_active: boolean
  sort_order: number
  min_order_amount: number
  allowed_tiers: UserTier[]
  allowed_regions: string[] | null
  created_at: string
}

// ─── Derived / client-side types ─────────────────────────────────────────────

export interface CompanionProduct {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  stock: number
  orders_last_30_days: number
  image: string | null
  category: string | null
  reason_copy: string
  points_multiplier: number
}

export interface InfluenceConfig {
  enabled: boolean
  intensity: InfluenceIntensity
  show_companions: boolean
  show_scarcity: boolean
  show_social_proof: boolean
  show_points_overlay: boolean
  show_streak_reminder: boolean
  show_bundle_framing: boolean
}

export interface UserCheckoutData {
  full_name: string
  phone: string
  email: string
  company: string | null
  last_shipping_address: {
    full_name: string
    phone: string
    email: string
    delivery_address: string
    city: string
    county?: string
    town?: string
    street?: string
    notes: string
  } | null
  points_balance: number
  pending_redemption: number
  streak_count: number
}

export type CheckoutStage = 1 | 2 | 3 | 4 | 5 | 6

export interface DeliveryDetails {
  full_name: string
  phone: string
  county: string
  town: string
  street: string
  delivery_region_id: string
}

export interface CheckoutState {
  stage: CheckoutStage
  delivery: DeliveryDetails
  selectedPayment: PaymentMethodKey | null
  addedCompanions: string[] // product IDs added during Stage 3
  pointsRedeemApplied: boolean
  orderId: string | null
}

export const DEFAULT_DELIVERY: DeliveryDetails = {
  full_name: '',
  phone: '',
  county: '',
  town: '',
  street: '',
  delivery_region_id: '',
}

export const DEFAULT_CHECKOUT_STATE: CheckoutState = {
  stage: 1,
  delivery: { ...DEFAULT_DELIVERY },
  selectedPayment: null,
  addedCompanions: [],
  pointsRedeemApplied: false,
  orderId: null,
}

// ─── Default checkout config ─────────────────────────────────────────────────

export const DEFAULT_CHECKOUT_CONFIG: CheckoutConfig = {
  id: 1,
  influence_default_retail: true,
  influence_default_wholesale: false,
  influence_intensity: 'medium',
  show_companions: true,
  show_scarcity: true,
  show_social_proof: true,
  show_points_overlay: true,
  show_streak_reminder: true,
  show_bundle_framing: true,
  influence_toggle_label: 'Smart suggestions — show me products and deals that match my order',
  updated_at: '',
}
