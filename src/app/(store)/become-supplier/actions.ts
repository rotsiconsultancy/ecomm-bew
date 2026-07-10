'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { sendSupplierEmail } from '@/lib/supplier-notifications'

function clean(value: FormDataEntryValue | null) {
  return String(value ?? '').trim()
}

function categories(value: FormDataEntryValue | null) {
  return clean(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export async function submitSupplierApplication(formData: FormData) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Please sign in before applying.' }

  const supabase = await createServiceClient()
  const companyName = clean(formData.get('company_name'))
  const email = clean(formData.get('email')).toLowerCase()

  if (!companyName || !email) {
    return { success: false, error: 'Company name and email are required.' }
  }

  const { data: existing } = await supabase
    .from('supplier_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .limit(1)
    .maybeSingle()

  if (existing?.status === 'pending') {
    return { success: false, error: 'You already have a pending supplier application.' }
  }
  if (existing?.status === 'approved') {
    return { success: false, error: 'Your supplier application has already been approved.' }
  }

  const payload = {
    user_id: user.id,
    company_name: companyName,
    contact_name: clean(formData.get('contact_name')),
    email,
    phone: clean(formData.get('phone')),
    kra_pin: clean(formData.get('kra_pin')),
    registration_number: clean(formData.get('registration_number')),
    location: clean(formData.get('location')),
    website_url: clean(formData.get('website_url')) || null,
    business_description: clean(formData.get('business_description')),
    product_categories: categories(formData.get('product_categories')),
    status: 'pending',
  }

  const required = ['contact_name', 'phone', 'kra_pin', 'registration_number', 'location', 'business_description'] as const
  for (const key of required) {
    if (!payload[key]) return { success: false, error: 'Please fill in all required fields.' }
  }

  const { data, error } = await supabase
    .from('supplier_applications')
    .insert(payload)
    .select('*')
    .maybeSingle()

  if (error || !data) return { success: false, error: error?.message ?? 'Failed to submit application.' }

  void sendSupplierEmail({
    eventKey: 'supplier_application_received',
    to: email,
    subject: 'Bewama supplier application received',
    title: 'Application received',
    message: `Thanks for applying to join Bewama as a supplier. Our team will review ${companyName} and respond after approval review.`,
    details: [
      { label: 'Company', value: companyName },
      { label: 'Status', value: 'Pending review' },
    ],
  })

  revalidatePath('/become-supplier')
  revalidatePath('/admin/suppliers')
  return { success: true, id: data.id }
}
