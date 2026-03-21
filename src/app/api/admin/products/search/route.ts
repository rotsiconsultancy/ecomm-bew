import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  await requireAdmin()
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const exclude = req.nextUrl.searchParams.get('exclude') ?? ''

  if (q.length < 2) return NextResponse.json({ products: [] })

  const supabase = await createServiceClient()

  let query = supabase
    .from('products')
    .select('id, name')
    .ilike('name', `%${q}%`)
    .eq('is_active', true)
    .limit(10)

  if (exclude) {
    query = query.neq('id', exclude)
  }

  const { data } = await query
  return NextResponse.json({ products: data ?? [] })
}
