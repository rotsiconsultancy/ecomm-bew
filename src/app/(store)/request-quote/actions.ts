'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { sendQuoteNotifications } from '@/lib/notifications'

export interface QuoteItem {
  product_name: string
  quantity: number
  unit: string
}

export async function createQuote(data: {
  full_name: string
  email: string
  phone: string
  company: string
  message: string
  items: QuoteItem[]
}) {
  const supabase = await createServiceClient()

  // Get user if logged in (quotes work for guests too)
  let userId: string | null = null
  try {
    const user = await getUser()
    userId = user?.id ?? null
  } catch {
    userId = null
  }

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      user_id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      message: data.message,
      items: data.items,
      status: 'pending',
    })
    .select('id')
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/quote-management')

  // Fire-and-forget — never block quote submission on email/SMS
  if (quote?.id) {
    void sendQuoteNotifications({
      id:       quote.id,
      full_name: data.full_name,
      email:    data.email,
      phone:    data.phone || undefined,
      items:    data.items,
      message:  data.message || undefined,
    })
  }

  return { success: true, id: quote?.id }
}
