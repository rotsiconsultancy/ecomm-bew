'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { sendOrderNotifications } from '@/lib/notifications'
import { finaliseRedemption } from '@/lib/points'
import { updateInfluencePreference } from '@/lib/checkout'

export async function createOrder(
  _userId: string, // kept for backwards compat — actual userId read from auth
  items: { product_id: string; name: string; price: number; currency: string; quantity: number; image: string | null }[],
  shippingAddress: { full_name: string; phone: string; email: string; delivery_address: string; city: string; notes: string },
  totalAmount: number
) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
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
    void finaliseRedemption(user.id, data.id)
  }

  return { success: true, id: data?.id }
}

// ─── Toggle user influence preference ────────────────────────────────────────

export async function toggleInfluenceAction(enabled: boolean) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  await updateInfluencePreference(user.id, enabled)
  return { success: true }
}
