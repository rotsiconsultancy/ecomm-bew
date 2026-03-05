'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function updateQuoteStatus(id: string, status: string, adminNotes?: string) {
  const supabase = await createServiceClient()

  const update: Record<string, unknown> = { status }
  if (adminNotes !== undefined) update.admin_notes = adminNotes

  const { error } = await supabase
    .from('quotes')
    .update(update)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/quote-management')
  revalidatePath(`/admin/quote-management/${id}`)
  return { success: true }
}

export async function convertQuoteToOrder(quoteId: string) {
  const supabase = await createServiceClient()

  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .maybeSingle()

  if (fetchError || !quote) return { success: false, error: fetchError?.message ?? 'Quote not found' }

  const items = (quote.items as { product_name: string; quantity: number; unit: string }[]).map((i) => ({
    product_id: null,
    name: i.product_name,
    price: 0,
    currency: 'KES',
    quantity: i.quantity,
    image: null,
  }))

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: quote.user_id ?? null,
      status: 'pending',
      total_amount: 0,
      currency: 'KES',
      shipping_address: {
        full_name: quote.full_name,
        phone: quote.phone,
        email: quote.email,
        delivery_address: '',
        city: '',
        notes: quote.message ?? '',
      },
      items,
      notes: `Converted from quote ${quoteId}`,
    })
    .select('id')
    .maybeSingle()

  if (orderError) return { success: false, error: orderError.message }

  // Mark quote as converted
  await supabase.from('quotes').update({ status: 'converted' }).eq('id', quoteId)

  revalidatePath('/admin/quote-management')
  revalidatePath('/admin/order-management')
  return { success: true, orderId: order?.id }
}
