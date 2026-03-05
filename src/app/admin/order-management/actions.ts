'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function updateOrderStatus(id: string, status: string, notes?: string) {
  const supabase = await createServiceClient()

  const update: Record<string, unknown> = { status }
  if (notes !== undefined) update.notes = notes

  const { error } = await supabase
    .from('orders')
    .update(update)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/order-management')
  revalidatePath(`/admin/order-management/${id}`)
  return { success: true }
}
