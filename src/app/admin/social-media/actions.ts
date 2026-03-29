'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'

export async function searchProducts(query: string) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price, currency, images')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return data ?? []
}
