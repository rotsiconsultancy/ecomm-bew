'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'
import { generateInviteToken, inviteExpiryDate, uniqueSupplierSlug } from '@/lib/suppliers'
import { sendSupplierEmail } from '@/lib/supplier-notifications'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

function clean(value: FormDataEntryValue | null) {
  return String(value ?? '').trim()
}

function categoriesFromForm(value: FormDataEntryValue | null) {
  return clean(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export async function approveSupplierApplication(applicationId: string) {
  const { user } = await getAdminContext()
  const supabase = await createServiceClient()

  const { data: app, error: appError } = await supabase
    .from('supplier_applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle()

  if (appError || !app) return { success: false, error: appError?.message ?? 'Application not found' }
  if (app.status !== 'pending') return { success: false, error: 'Application has already been reviewed.' }

  const slug = await uniqueSupplierSlug(app.company_name)
  const { data: supplier, error: supplierError } = await supabase
    .from('suppliers')
    .insert({
      company_name: app.company_name,
      slug,
      primary_contact_name: app.contact_name,
      primary_email: app.email,
      phone: app.phone,
      kra_pin: app.kra_pin,
      registration_number: app.registration_number,
      location: app.location,
      website_url: app.website_url,
      business_description: app.business_description,
      product_categories: app.product_categories,
      package_key: 'starter',
      status: 'active',
      created_from_application_id: app.id,
    })
    .select('*')
    .maybeSingle()

  if (supplierError || !supplier) return { success: false, error: supplierError?.message ?? 'Failed to create supplier' }

  const { error: memberError } = await supabase.from('supplier_members').insert({
    supplier_id: supplier.id,
    user_id: app.user_id,
    email: app.email,
    member_role: 'owner',
    status: 'active',
    invited_by: user.id,
    accepted_at: new Date().toISOString(),
  })

  if (memberError) return { success: false, error: memberError.message }

  await Promise.all([
    supabase
      .from('supplier_applications')
      .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', app.id),
    supabase
      .from('profiles')
      .update({ role: 'supplier' })
      .eq('id', app.user_id),
  ])

  void sendSupplierEmail({
    supplierId: supplier.id,
    eventKey: 'supplier_application_approved',
    to: app.email,
    subject: 'Your Bewama supplier application was approved',
    title: 'Supplier application approved',
    message: `Your supplier company ${supplier.company_name} is active. You can now complete setup in the supplier portal.`,
    ctaLabel: 'Open supplier portal',
    ctaUrl: `${SITE_URL}/supplier-portal`,
    details: [
      { label: 'Company', value: supplier.company_name },
      { label: 'Package', value: 'Starter' },
    ],
  })

  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function rejectSupplierApplication(applicationId: string, formData: FormData) {
  const { user } = await getAdminContext()
  const supabase = await createServiceClient()
  const notes = clean(formData.get('admin_notes')) || 'Application rejected.'

  const { data: app, error } = await supabase
    .from('supplier_applications')
    .update({ status: 'rejected', reviewed_by: user.id, reviewed_at: new Date().toISOString(), admin_notes: notes })
    .eq('id', applicationId)
    .select('*')
    .maybeSingle()

  if (error || !app) return { success: false, error: error?.message ?? 'Application not found' }

  void sendSupplierEmail({
    eventKey: 'supplier_application_rejected',
    to: app.email,
    subject: 'Your Bewama supplier application update',
    title: 'Supplier application reviewed',
    message: `Your supplier application for ${app.company_name} was not approved at this time. ${notes}`,
    details: [{ label: 'Company', value: app.company_name }],
  })

  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function createSupplierAction(formData: FormData) {
  const { user } = await getAdminContext()
  const supabase = await createServiceClient()
  const companyName = clean(formData.get('company_name'))
  const ownerEmail = clean(formData.get('owner_email')).toLowerCase()
  const contactName = clean(formData.get('primary_contact_name'))

  if (!companyName || !ownerEmail || !contactName) {
    return { success: false, error: 'Company name, contact name, and owner email are required.' }
  }

  const slug = await uniqueSupplierSlug(companyName)
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .insert({
      company_name: companyName,
      slug,
      primary_contact_name: contactName,
      primary_email: ownerEmail,
      phone: clean(formData.get('phone')),
      kra_pin: clean(formData.get('kra_pin')) || null,
      registration_number: clean(formData.get('registration_number')) || null,
      location: clean(formData.get('location')) || null,
      website_url: clean(formData.get('website_url')) || null,
      business_description: clean(formData.get('business_description')) || null,
      product_categories: categoriesFromForm(formData.get('product_categories')),
      package_key: clean(formData.get('package_key')) || 'starter',
      status: 'invited',
    })
    .select('*')
    .maybeSingle()

  if (error || !supplier) return { success: false, error: error?.message ?? 'Failed to create supplier' }

  const { token, tokenHash } = generateInviteToken()
  const { error: memberError } = await supabase.from('supplier_members').insert({
    supplier_id: supplier.id,
    email: ownerEmail,
    member_role: 'owner',
    status: 'invited',
    invited_by: user.id,
    invite_token_hash: tokenHash,
    invite_expires_at: inviteExpiryDate(),
  })

  if (memberError) return { success: false, error: memberError.message }

  void sendSupplierEmail({
    supplierId: supplier.id,
    eventKey: 'supplier_invite',
    to: ownerEmail,
    subject: 'You have been invited to join Bewama as a supplier',
    title: 'Join Bewama supplier portal',
    message: `${contactName}, you have been invited to manage ${companyName} on Bewama. This invite expires in 7 days.`,
    ctaLabel: 'Accept supplier invite',
    ctaUrl: `${SITE_URL}/supplier-portal/invite/${token}`,
    details: [
      { label: 'Company', value: companyName },
      { label: 'Role', value: 'Owner' },
    ],
  })

  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function updateSupplierStatus(supplierId: string, status: 'active' | 'suspended', formData?: FormData) {
  const { user } = await getAdminContext()
  const supabase = await createServiceClient()
  const reason = formData ? clean(formData.get('reason')) : ''

  const patch = status === 'suspended'
    ? { status, suspended_at: new Date().toISOString(), suspended_by: user.id, suspension_reason: reason || 'Suspended by admin.' }
    : { status, suspended_at: null, suspended_by: null, suspension_reason: null }

  const { data: supplier, error } = await supabase
    .from('suppliers')
    .update(patch)
    .eq('id', supplierId)
    .select('*')
    .maybeSingle()

  if (error || !supplier) return { success: false, error: error?.message ?? 'Supplier not found' }

  void sendSupplierEmail({
    supplierId,
    eventKey: status === 'suspended' ? 'supplier_suspended' : 'supplier_reactivated',
    to: supplier.primary_email,
    subject: status === 'suspended' ? 'Bewama supplier account suspended' : 'Bewama supplier account reactivated',
    title: status === 'suspended' ? 'Supplier account suspended' : 'Supplier account reactivated',
    message: status === 'suspended'
      ? `Your supplier account ${supplier.company_name} has been suspended. ${reason}`
      : `Your supplier account ${supplier.company_name} has been reactivated.`,
  })

  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function updateSupplierPackage(supplierId: string, packageKey: string) {
  await getAdminContext()
  const supabase = await createServiceClient()
  const { error } = await supabase.from('suppliers').update({ package_key: packageKey }).eq('id', supplierId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function updateSupplierPackageConfig(packageKey: string, formData: FormData) {
  await getAdminContext()
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('supplier_packages')
    .update({
      name: clean(formData.get('name')),
      description: clean(formData.get('description')) || null,
      max_staff: Number(clean(formData.get('max_staff')) || 0),
      max_active_products: Number(clean(formData.get('max_active_products')) || 0),
      max_product_images: Number(clean(formData.get('max_product_images')) || 0),
      analytics_level: clean(formData.get('analytics_level')) || 'basic',
      is_active: formData.get('is_active') === 'on',
    })
    .eq('key', packageKey)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function saveDeliveryRegion(formData: FormData) {
  await getAdminContext()
  const supabase = await createServiceClient()
  const id = clean(formData.get('id'))
  const payload = {
    name: clean(formData.get('name')),
    region_type: clean(formData.get('region_type')) || 'city',
    sort_order: Number(clean(formData.get('sort_order')) || 0),
    is_active: formData.get('is_active') !== 'off',
  }

  const query = id
    ? supabase.from('delivery_regions').update(payload).eq('id', id)
    : supabase.from('delivery_regions').insert(payload)

  const { error } = await query
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function createSupplierWarning(supplierId: string, formData: FormData) {
  const { user } = await getAdminContext()
  const supabase = await createServiceClient()
  const notes = clean(formData.get('notes'))
  const severity = clean(formData.get('severity')) || 'warning'

  const { data: supplier } = await supabase.from('suppliers').select('*').eq('id', supplierId).maybeSingle()
  const { error } = await supabase.from('supplier_performance_events').insert({
    supplier_id: supplierId,
    event_type: 'warning',
    severity,
    notes,
    created_by: user.id,
  })

  if (error) return { success: false, error: error.message }

  if (supplier) {
    void sendSupplierEmail({
      supplierId,
      eventKey: 'supplier_warning',
      to: supplier.primary_email,
      subject: 'Bewama supplier performance warning',
      title: 'Supplier performance warning',
      message: notes || 'Bewama has added a performance warning to your supplier account.',
      details: [{ label: 'Severity', value: severity }],
    })
  }

  revalidatePath('/admin/suppliers')
  return { success: true }
}

export async function pauseSupplierProduct(productId: string, formData: FormData) {
  const { user } = await getAdminContext()
  const supabase = await createServiceClient()
  const reason = clean(formData.get('reason')) || 'Paused by Bewama admin.'

  const { data: product, error } = await supabase
    .from('products')
    .update({
      product_status: 'paused_by_admin',
      is_active: false,
      paused_at: new Date().toISOString(),
      paused_by: user.id,
      pause_reason: reason,
    })
    .eq('id', productId)
    .select('id, name, supplier_id, suppliers(primary_email, company_name)')
    .maybeSingle()

  if (error || !product) return { success: false, error: error?.message ?? 'Product not found' }

  const supplier = Array.isArray(product.suppliers) ? product.suppliers[0] : product.suppliers
  if (product.supplier_id && supplier?.primary_email) {
    void sendSupplierEmail({
      supplierId: product.supplier_id,
      eventKey: 'supplier_product_paused',
      to: supplier.primary_email,
      subject: `Product paused on Bewama: ${product.name}`,
      title: 'Product paused by Bewama',
      message: `${product.name} has been paused by Bewama. ${reason}`,
      relatedProductId: product.id,
    })
  }

  revalidatePath('/admin/suppliers')
  revalidatePath('/admin/product-management')
  revalidatePath('/products')
  return { success: true }
}

export async function overrideFulfilmentStatus(fulfilmentId: string, status: string, formData?: FormData) {
  await getAdminContext()
  const supabase = await createServiceClient()
  const reason = formData ? clean(formData.get('reason')) : ''
  const patch: Record<string, string | null> = { status }
  if (status === 'rejected') {
    patch.rejected_reason = reason || 'Rejected by admin.'
    patch.rejected_at = new Date().toISOString()
  }

  const { error } = await supabase.from('supplier_fulfilments').update(patch).eq('id', fulfilmentId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/order-management')
  revalidatePath('/admin/suppliers')
  return { success: true }
}
