import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const body = await req.json()
  const { product_id, companion_product_id, sort_order } = body

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('product_companions')
    .insert({ product_id, companion_product_id, sort_order })
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, id: data?.id })
}

export async function DELETE(req: NextRequest) {
  await requireAdmin()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('product_companions')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
