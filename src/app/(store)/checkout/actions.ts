'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { sendOrderNotifications } from '@/lib/notifications'
import { finaliseRedemption } from '@/lib/points'

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

  // Fire-and-forget — never block order confirmation on email/SMS or points
  if (data?.id) {
    void sendOrderNotifications({
      id:              data.id,
      customer_name:   shippingAddress.full_name,
      customer_email:  shippingAddress.email,
      customer_phone:  shippingAddress.phone || undefined,
      items:           items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, currency: i.currency })),
      total:           totalAmount,
      currency:        items[0]?.currency ?? 'KES',
      delivery_method: shippingAddress.city ? `Delivery to ${shippingAddress.city}` : 'Delivery',
    })

    // Finalise any pending points redemption — attach to this order
    void finaliseRedemption(userId, data.id)
  }

  return { success: true, id: data?.id }
}
