'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function createOrder(
  userId: string,
  items: { product_id: string; name: string; price: number; currency: string; quantity: number; image: string | null }[],
  shippingAddress: { full_name: string; phone: string; email: string; delivery_address: string; city: string; notes: string },
  totalAmount: number
) {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending',
      total_amount: totalAmount,
      currency: items[0]?.currency ?? 'KES',
      shipping_address: shippingAddress,
      items,
      notes: shippingAddress.notes || null,
    })
    .select('id')
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/order-management')
  return { success: true, id: data?.id }
}
