export type SupplierStatus = 'invited' | 'active' | 'suspended'
export type SupplierApplicationStatus = 'pending' | 'approved' | 'rejected'
export type SupplierMemberRole = 'owner' | 'manager' | 'product_manager' | 'fulfilment' | 'viewer'
export type SupplierMemberStatus = 'invited' | 'active' | 'removed'
export type SupplierProductStatus = 'active' | 'inactive' | 'paused_by_admin'
export type SupplierFulfilmentStatus =
  | 'new'
  | 'accepted'
  | 'rejected'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'delivered'
  | 'cancelled_by_admin'
export type FulfilmentOwner = 'bewama' | 'supplier'
export type FeeStrategy = 'flat' | 'cart_total' | 'weight' | 'order_size'
export type RegionType = 'city' | 'county' | 'area'
export type SupplierEventKey =
  | 'supplier_application_received'
  | 'supplier_application_approved'
  | 'supplier_application_rejected'
  | 'supplier_invite'
  | 'supplier_staff_invite'
  | 'supplier_staff_joined'
  | 'new_supplier_fulfilment'
  | 'supplier_rejected_fulfilment'
  | 'buyer_multi_fulfilment_confirmation'
  | 'buyer_support_request_confirmation'
  | 'supplier_product_paused'
  | 'supplier_warning'
  | 'supplier_auto_pause'
  | 'supplier_suspended'
  | 'supplier_reactivated'

export interface SupplierPackage {
  key: 'starter' | 'growth' | 'enterprise' | string
  name: string
  description: string | null
  max_staff: number
  max_active_products: number
  max_product_images: number
  analytics_level: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierApplication {
  id: string
  user_id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  kra_pin: string
  registration_number: string
  location: string
  website_url: string | null
  business_description: string
  product_categories: string[]
  status: SupplierApplicationStatus
  reviewed_by: string | null
  reviewed_at: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  company_name: string
  slug: string
  primary_contact_name: string
  primary_email: string
  phone: string
  kra_pin: string | null
  registration_number: string | null
  location: string | null
  website_url: string | null
  business_description: string | null
  product_categories: string[]
  package_key: string
  status: SupplierStatus
  suspended_at: string | null
  suspended_by: string | null
  suspension_reason: string | null
  created_from_application_id: string | null
  created_at: string
  updated_at: string
}

export interface SupplierMember {
  id: string
  supplier_id: string
  user_id: string | null
  email: string
  member_role: SupplierMemberRole
  status: SupplierMemberStatus
  invited_by: string | null
  invite_token_hash: string | null
  invite_expires_at: string | null
  accepted_at: string | null
  removed_at: string | null
  created_at: string
  updated_at: string
}

export interface DeliveryRegion {
  id: string
  name: string
  region_type: RegionType
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface SupplierDeliveryRule {
  id: string
  supplier_id: string
  region_id: string
  fee_strategy: FeeStrategy
  base_fee: number
  free_over_amount: number | null
  per_kg_fee: number | null
  per_item_fee: number | null
  min_fee: number | null
  max_fee: number | null
  lead_time_min_days: number
  lead_time_max_days: number
  is_active: boolean
  created_at: string
  updated_at: string
  delivery_regions?: DeliveryRegion
}

export interface SupplierNotificationEmail {
  id: string
  supplier_id: string
  label: string
  email: string
  events: SupplierEventKey[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierFulfilmentItem {
  product_id: string | null
  name: string
  price: number
  currency: string
  quantity: number
  image: string | null
  supplier_id?: string | null
  weight_kg?: number | null
}

export interface SupplierFulfilment {
  id: string
  order_id: string
  supplier_id: string | null
  fulfilment_owner: FulfilmentOwner
  status: SupplierFulfilmentStatus
  items: SupplierFulfilmentItem[]
  subtotal_amount: number
  delivery_fee: number
  currency: string
  delivery_region_id: string | null
  lead_time_min_days: number | null
  lead_time_max_days: number | null
  rejected_reason: string | null
  rejected_at: string | null
  accepted_at: string | null
  dispatched_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  suppliers?: Supplier | null
}

export interface SupplierPerformanceEvent {
  id: string
  supplier_id: string
  event_type: 'warning' | 'late_fulfilment' | 'rejection' | 'manual_note' | 'auto_pause'
  severity: 'info' | 'warning' | 'critical'
  related_fulfilment_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface SupplierContext {
  supplier: Supplier
  member: SupplierMember
  package: SupplierPackage | null
}

export const SUPPLIER_MEMBER_ROLES: { value: SupplierMemberRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'fulfilment', label: 'Fulfilment' },
  { value: 'viewer', label: 'Viewer' },
]

export const SUPPLIER_NOTIFICATION_EVENTS: { value: SupplierEventKey; label: string }[] = [
  { value: 'new_supplier_fulfilment', label: 'New fulfilment' },
  { value: 'supplier_rejected_fulfilment', label: 'Rejected fulfilment alerts' },
  { value: 'supplier_product_paused', label: 'Product paused' },
  { value: 'supplier_warning', label: 'Supplier warning' },
  { value: 'supplier_suspended', label: 'Suspension' },
  { value: 'supplier_reactivated', label: 'Reactivation' },
]
