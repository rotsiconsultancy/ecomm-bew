'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import {
  canManageSupplierFulfilments,
  canManageSupplierProducts,
  generateInviteToken,
  hashInviteToken,
  inviteExpiryDate,
  requireSupplierContext,
  requireSupplierRole,
  supplierSlugify,
} from '@/lib/suppliers'
import { createClient } from '@/lib/supabase/server'
import { sendSupplierEmail } from '@/lib/supplier-notifications'
import type { SupplierMemberRole } from '@/types/supplier'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

function clean(value: FormDataEntryValue | null) {
  return String(value ?? '').trim()
}

function categories(value: FormDataEntryValue | null) {
  return clean(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function numberOrNull(value: FormDataEntryValue | null) {
  const n = Number(clean(value))
  return Number.isFinite(n) && n > 0 ? n : null
}

export async function updateSupplierCompany(formData: FormData) {
  const ctx = await requireSupplierRole(['owner', 'manager'])
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('suppliers')
    .update({
      primary_contact_name: clean(formData.get('primary_contact_name')),
      phone: clean(formData.get('phone')),
      location: clean(formData.get('location')),
      website_url: clean(formData.get('website_url')) || null,
      business_description: clean(formData.get('business_description')) || null,
      product_categories: categories(formData.get('product_categories')),
    })
    .eq('id', ctx.supplier.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/supplier-portal')
  return { success: true }
}

export async function acceptSupplierInvite(token: string) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return { success: false, error: 'Please sign in to accept this invite.' }

  const supabase = await createServiceClient()
  const tokenHash = hashInviteToken(token)
  const { data: member, error } = await supabase
    .from('supplier_members')
    .select('*, suppliers(*)')
    .eq('invite_token_hash', tokenHash)
    .eq('status', 'invited')
    .maybeSingle()

  if (error || !member) return { success: false, error: 'Invite not found or already used.' }
  if (member.invite_expires_at && new Date(member.invite_expires_at) < new Date()) {
    return { success: false, error: 'This invite has expired. Ask Bewama or the supplier owner to resend it.' }
  }
  if (member.email.toLowerCase() !== (user.email ?? '').toLowerCase()) {
    return { success: false, error: `This invite was sent to ${member.email}. Sign in with that email to accept it.` }
  }

  await Promise.all([
    supabase
      .from('supplier_members')
      .update({
        user_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
        invite_token_hash: null,
      })
      .eq('id', member.id),
    supabase
      .from('suppliers')
      .update({ status: 'active' })
      .eq('id', member.supplier_id)
      .eq('status', 'invited'),
    supabase
      .from('profiles')
      .upsert({ id: user.id, role: 'supplier' }),
  ])

  const supplier = Array.isArray(member.suppliers) ? member.suppliers[0] : member.suppliers
  if (supplier) {
    void sendSupplierEmail({
      supplierId: member.supplier_id,
      eventKey: 'supplier_staff_joined',
      to: supplier.primary_email,
      subject: `${user.email} joined ${supplier.company_name}`,
      title: 'Supplier staff joined',
      message: `${user.email} accepted their invite to join ${supplier.company_name}.`,
    })
  }

  revalidatePath('/supplier-portal')
  return { success: true }
}

export async function inviteSupplierStaff(formData: FormData) {
  const ctx = await requireSupplierRole(['owner', 'manager'])
  const supabase = await createServiceClient()
  const email = clean(formData.get('email')).toLowerCase()
  const role = clean(formData.get('member_role')) as SupplierMemberRole

  if (!email || !role) return { success: false, error: 'Email and role are required.' }

  const { token, tokenHash } = generateInviteToken()
  const { error } = await supabase.from('supplier_members').insert({
    supplier_id: ctx.supplier.id,
    email,
    member_role: role,
    status: 'invited',
    invited_by: ctx.member.user_id,
    invite_token_hash: tokenHash,
    invite_expires_at: inviteExpiryDate(),
  })

  if (error) return { success: false, error: error.message }

  void sendSupplierEmail({
    supplierId: ctx.supplier.id,
    eventKey: 'supplier_staff_invite',
    to: email,
    subject: `Invitation to join ${ctx.supplier.company_name} on Bewama`,
    title: 'Supplier staff invite',
    message: `You have been invited to join ${ctx.supplier.company_name} on Bewama. This invite expires in 7 days.`,
    ctaLabel: 'Accept invite',
    ctaUrl: `${SITE_URL}/supplier-portal/invite/${token}`,
    details: [
      { label: 'Company', value: ctx.supplier.company_name },
      { label: 'Role', value: role.replace('_', ' ') },
    ],
  })

  revalidatePath('/supplier-portal')
  return { success: true }
}

export async function updateSupplierMember(memberId: string, formData: FormData) {
  const ctx = await requireSupplierRole(['owner', 'manager'])
  const supabase = await createServiceClient()
  const role = clean(formData.get('member_role')) as SupplierMemberRole
  const status = clean(formData.get('status')) || 'active'

  const { data: target } = await supabase
    .from('supplier_members')
    .select('*')
    .eq('id', memberId)
    .eq('supplier_id', ctx.supplier.id)
    .maybeSingle()

  if (!target) return { success: false, error: 'Member not found.' }

  if (target.member_role === 'owner' && status === 'removed') {
    const { count } = await supabase
      .from('supplier_members')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', ctx.supplier.id)
      .eq('member_role', 'owner')
      .eq('status', 'active')
    if ((count ?? 0) <= 1) return { success: false, error: 'Cannot remove the last active owner.' }
  }

  const { error } = await supabase
    .from('supplier_members')
    .update({
      member_role: role || target.member_role,
      status,
      removed_at: status === 'removed' ? new Date().toISOString() : null,
    })
    .eq('id', memberId)
    .eq('supplier_id', ctx.supplier.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/supplier-portal')
  return { success: true }
}

export async function saveSupplierDeliveryRule(formData: FormData) {
  const ctx = await requireSupplierRole(['owner', 'manager'])
  const supabase = await createServiceClient()
  const id = clean(formData.get('id'))
  const payload = {
    supplier_id: ctx.supplier.id,
    region_id: clean(formData.get('region_id')),
    fee_strategy: clean(formData.get('fee_strategy')) || 'flat',
    base_fee: Number(clean(formData.get('base_fee')) || 0),
    free_over_amount: numberOrNull(formData.get('free_over_amount')),
    per_kg_fee: numberOrNull(formData.get('per_kg_fee')),
    per_item_fee: numberOrNull(formData.get('per_item_fee')),
    min_fee: numberOrNull(formData.get('min_fee')),
    max_fee: numberOrNull(formData.get('max_fee')),
    lead_time_min_days: Number(clean(formData.get('lead_time_min_days')) || 1),
    lead_time_max_days: Number(clean(formData.get('lead_time_max_days')) || 3),
    is_active: formData.get('is_active') !== 'off',
  }

  const query = id
    ? supabase.from('supplier_delivery_rules').update(payload).eq('id', id).eq('supplier_id', ctx.supplier.id)
    : supabase.from('supplier_delivery_rules').insert(payload)

  const { error } = await query
  if (error) return { success: false, error: error.message }
  revalidatePath('/supplier-portal')
  return { success: true }
}

export async function saveSupplierNotificationEmail(formData: FormData) {
  const ctx = await requireSupplierRole(['owner', 'manager'])
  const supabase = await createServiceClient()
  const id = clean(formData.get('id'))
  const events = formData.getAll('events').flatMap((value) => categories(value))
  const payload = {
    supplier_id: ctx.supplier.id,
    label: clean(formData.get('label')),
    email: clean(formData.get('email')).toLowerCase(),
    events,
    is_active: formData.get('is_active') !== 'off',
  }

  const query = id
    ? supabase.from('supplier_notification_emails').update(payload).eq('id', id).eq('supplier_id', ctx.supplier.id)
    : supabase.from('supplier_notification_emails').insert(payload)

  const { error } = await query
  if (error) return { success: false, error: error.message }
  revalidatePath('/supplier-portal')
  return { success: true }
}

export async function saveSupplierProduct(formData: FormData) {
  const ctx = await requireSupplierContext()
  if (!canManageSupplierProducts(ctx.member.member_role)) {
    return { success: false, error: 'You do not have permission to manage products.' }
  }

  const supabase = await createServiceClient()
  const id = clean(formData.get('id'))
  const name = clean(formData.get('name'))
  const pricingType = clean(formData.get('pricing_type')) || 'fixed'
  const isActive = formData.get('is_active') === 'on'
  const weightKg = numberOrNull(formData.get('weight_kg'))
  const lengthCm = numberOrNull(formData.get('length_cm'))
  const widthCm = numberOrNull(formData.get('width_cm'))
  const heightCm = numberOrNull(formData.get('height_cm'))

  if (!name) return { success: false, error: 'Product name is required.' }
  if (isActive && (!weightKg || !lengthCm || !widthCm || !heightCm)) {
    return { success: false, error: 'Weight and dimensions are required before publishing supplier products.' }
  }

  const slug = clean(formData.get('slug')) || supplierSlugify(name)
  const images = categories(formData.get('images'))
  const descriptionText = clean(formData.get('description'))
  const payload = {
    supplier_id: ctx.supplier.id,
    name,
    slug,
    description: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: descriptionText || name }] }] }),
    pricing_type: pricingType,
    price: pricingType === 'quote' ? 0 : Number(clean(formData.get('price')) || 0),
    currency: clean(formData.get('currency')) || 'KES',
    category: clean(formData.get('category')) || null,
    brand: clean(formData.get('brand')) || null,
    stock: Number(clean(formData.get('stock')) || 0),
    images,
    is_active: isActive,
    product_status: isActive ? 'active' : 'inactive',
    fulfilment_type: clean(formData.get('fulfilment_type')) || 'supplier_fulfilled',
    supplier_sku: clean(formData.get('supplier_sku')) || null,
    weight_kg: weightKg,
    length_cm: lengthCm,
    width_cm: widthCm,
    height_cm: heightCm,
    seo_title: clean(formData.get('seo_title')) || null,
    seo_description: clean(formData.get('seo_description')) || null,
    seo_keywords: clean(formData.get('seo_keywords')) || null,
  }

  const query = id
    ? supabase.from('products').update(payload).eq('id', id).eq('supplier_id', ctx.supplier.id)
    : supabase.from('products').insert(payload)

  const { error } = await query
  if (error) return { success: false, error: error.message }

  revalidatePath('/supplier-portal')
  revalidatePath('/products')
  if (slug) revalidatePath(`/products/${slug}`)
  return { success: true }
}

export async function updateSupplierFulfilmentStatus(fulfilmentId: string, formData: FormData) {
  const ctx = await requireSupplierContext()
  if (!canManageSupplierFulfilments(ctx.member.member_role)) {
    return { success: false, error: 'You do not have permission to update fulfilments.' }
  }

  const supabase = await createServiceClient()
  const status = clean(formData.get('status'))
  const reason = clean(formData.get('rejected_reason'))
  const now = new Date().toISOString()
  const patch: Record<string, string | null> = { status }

  if (status === 'accepted') patch.accepted_at = now
  if (status === 'dispatched') patch.dispatched_at = now
  if (status === 'delivered') patch.delivered_at = now
  if (status === 'rejected') {
    if (!reason) return { success: false, error: 'Rejection reason is required.' }
    patch.rejected_reason = reason
    patch.rejected_at = now
  }

  const { data: fulfilment, error } = await supabase
    .from('supplier_fulfilments')
    .update(patch)
    .eq('id', fulfilmentId)
    .eq('supplier_id', ctx.supplier.id)
    .select('*')
    .maybeSingle()

  if (error || !fulfilment) return { success: false, error: error?.message ?? 'Fulfilment not found.' }

  if (status === 'rejected') {
    await supabase.from('supplier_performance_events').insert({
      supplier_id: ctx.supplier.id,
      event_type: 'rejection',
      severity: 'warning',
      related_fulfilment_id: fulfilment.id,
      notes: reason,
      created_by: ctx.member.user_id,
    })
  }

  revalidatePath('/supplier-portal')
  revalidatePath('/admin/order-management')
  return { success: true }
}
