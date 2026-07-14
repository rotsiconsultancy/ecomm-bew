import { createHash, randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type {
  DeliveryRegion,
  FeeStrategy,
  Supplier,
  SupplierContext,
  SupplierDeliveryRule,
  SupplierFulfilmentItem,
  SupplierMemberRole,
  SupplierPackage,
} from '@/types/supplier'
import type { CartItem } from '@/lib/cart-store'

export const SUPPLIER_INVITE_DAYS = 7

export function supplierSlugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function uniqueSupplierSlug(name: string) {
  const supabase = await createServiceClient()
  const base = supplierSlugify(name) || 'supplier'
  let slug = base
  let i = 2

  while (true) {
    const { data } = await supabase
      .from('suppliers')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!data) return slug
    slug = `${base}-${i++}`
  }
}

export function generateInviteToken() {
  const token = randomBytes(32).toString('hex')
  return { token, tokenHash: hashInviteToken(token) }
}

export function hashInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function inviteExpiryDate(days = SUPPLIER_INVITE_DAYS) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function canManageSupplierProducts(role: SupplierMemberRole) {
  return role === 'owner' || role === 'manager' || role === 'product_manager'
}

export function canManageSupplierFulfilments(role: SupplierMemberRole) {
  return role === 'owner' || role === 'manager' || role === 'fulfilment'
}

export function canManageSupplierSettings(role: SupplierMemberRole) {
  return role === 'owner' || role === 'manager'
}

export async function getSupplierContext(): Promise<SupplierContext | null> {
  const supabase = await createClient()
  const service = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: member } = await service
    .from('supplier_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!member) return null

  const { data: supplier } = await service
    .from('suppliers')
    .select('*')
    .eq('id', member.supplier_id)
    .maybeSingle()

  if (!supplier) return null

  const { data: supplierPackage } = await service
    .from('supplier_packages')
    .select('*')
    .eq('key', supplier.package_key)
    .maybeSingle()

  return {
    supplier: supplier as Supplier,
    member: member as SupplierContext['member'],
    package: (supplierPackage ?? null) as SupplierPackage | null,
  }
}

export async function requireSupplierContext(): Promise<SupplierContext> {
  const ctx = await getSupplierContext()
  if (!ctx) redirect('/become-supplier')
  return ctx
}

export async function requireSupplierRole(allowed: SupplierMemberRole[]) {
  const ctx = await requireSupplierContext()
  if (!allowed.includes(ctx.member.member_role)) redirect('/supplier-portal')
  return ctx
}

export interface CheckoutGroupItem extends SupplierFulfilmentItem {
  supplier_id: string | null
}

export interface CheckoutFulfilmentGroup {
  key: string
  supplier_id: string | null
  supplier_name: string
  owner: 'bewama' | 'supplier'
  items: CheckoutGroupItem[]
  subtotal: number
  delivery_fee: number
  currency: string
  region_id: string | null
  region_name: string | null
  lead_time_min_days: number | null
  lead_time_max_days: number | null
  support_required: boolean
  support_reason: string | null
}

type ProductForCheckout = {
  id: string
  name: string
  supplier_id: string | null
  weight_kg: number | null
  suppliers?: Pick<Supplier, 'id' | 'company_name' | 'status'> | Pick<Supplier, 'id' | 'company_name' | 'status'>[] | null
}

function clampFee(fee: number, rule: SupplierDeliveryRule) {
  let next = fee
  if (rule.min_fee !== null) next = Math.max(next, Number(rule.min_fee))
  if (rule.max_fee !== null) next = Math.min(next, Number(rule.max_fee))
  return Math.max(0, next)
}

export function calculateRuleFee(rule: SupplierDeliveryRule, items: CheckoutGroupItem[], subtotal: number) {
  if (rule.free_over_amount !== null && subtotal >= Number(rule.free_over_amount)) return 0

  const base = Number(rule.base_fee ?? 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const weight = items.reduce((sum, i) => sum + Number(i.weight_kg ?? 0) * i.quantity, 0)
  const strategy = rule.fee_strategy as FeeStrategy

  if (strategy === 'weight') return clampFee(base + weight * Number(rule.per_kg_fee ?? 0), rule)
  if (strategy === 'order_size') return clampFee(base + count * Number(rule.per_item_fee ?? 0), rule)
  if (strategy === 'cart_total') return clampFee(base, rule)
  return clampFee(base, rule)
}

export async function getActiveDeliveryRegions(): Promise<DeliveryRegion[]> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('delivery_regions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (data ?? []) as DeliveryRegion[]
}

export async function groupCartForSupplierCheckout(cartItems: CartItem[], regionId?: string | null) {
  if (cartItems.length === 0) {
    return { eligible: [] as CheckoutFulfilmentGroup[], support: [] as CheckoutFulfilmentGroup[] }
  }

  const service = await createServiceClient()
  const productIds = cartItems.map((i) => i.product_id)
  const { data: products } = await service
    .from('products')
    .select('id, name, supplier_id, weight_kg, suppliers(id, company_name, status)')
    .in('id', productIds)

  const productMap = new Map((products ?? []).map((p) => [p.id, p as unknown as ProductForCheckout]))
  const byKey = new Map<string, CheckoutFulfilmentGroup>()

  for (const item of cartItems) {
    const product = productMap.get(item.product_id)
    const supplierId = product?.supplier_id ?? null
    const supplierRelation = product?.suppliers ?? null
    const supplier = Array.isArray(supplierRelation) ? supplierRelation[0] ?? null : supplierRelation
    const key = supplierId ?? 'bewama'
    const owner = supplierId ? 'supplier' : 'bewama'

    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        supplier_id: supplierId,
        supplier_name: owner === 'bewama' ? 'Bewama' : supplier?.company_name ?? 'Supplier',
        owner,
        items: [],
        subtotal: 0,
        delivery_fee: 0,
        currency: item.currency ?? 'KES',
        region_id: regionId ?? null,
        region_name: null,
        lead_time_min_days: null,
        lead_time_max_days: null,
        support_required: supplierId ? supplier?.status !== 'active' : false,
        support_reason: supplierId && supplier?.status !== 'active' ? 'Supplier is not active.' : null,
      })
    }

    const group = byKey.get(key)!
    const checkoutItem: CheckoutGroupItem = {
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity,
      image: item.image,
      supplier_id: supplierId,
      weight_kg: product?.weight_kg ?? null,
    }
    group.items.push(checkoutItem)
    group.subtotal += item.price * item.quantity
  }

  const groups = Array.from(byKey.values())
  const supplierIds = groups.map((g) => g.supplier_id).filter(Boolean) as string[]
  const rulesBySupplier = new Map<string, SupplierDeliveryRule>()
  let regionName: string | null = null

  if (regionId) {
    const [{ data: rules }, { data: region }] = await Promise.all([
      supplierIds.length
        ? service
            .from('supplier_delivery_rules')
            .select('*, delivery_regions(*)')
            .in('supplier_id', supplierIds)
            .eq('region_id', regionId)
            .eq('is_active', true)
        : Promise.resolve({ data: [] }),
      service.from('delivery_regions').select('*').eq('id', regionId).maybeSingle(),
    ])

    regionName = region?.name ?? null
    for (const rule of rules ?? []) {
      rulesBySupplier.set(rule.supplier_id, rule as SupplierDeliveryRule)
    }
  }

  for (const group of groups) {
    group.region_name = regionName

    if (group.owner === 'bewama') {
      group.delivery_fee = 0
      continue
    }

    if (!regionId) {
      group.support_required = true
      group.support_reason = 'Delivery region is required.'
      continue
    }

    const rule = group.supplier_id ? rulesBySupplier.get(group.supplier_id) : null
    if (!rule) {
      group.support_required = true
      group.support_reason = 'This supplier does not have delivery configured for the selected region.'
      continue
    }

    group.delivery_fee = calculateRuleFee(rule, group.items, group.subtotal)
    group.lead_time_min_days = rule.lead_time_min_days
    group.lead_time_max_days = rule.lead_time_max_days
  }

  return {
    eligible: groups.filter((g) => !g.support_required),
    support: groups.filter((g) => g.support_required),
  }
}
