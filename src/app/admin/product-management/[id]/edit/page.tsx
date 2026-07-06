import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminContext } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import ProductForm from '../../product-form'
import { CompanionEditor } from './companion-editor'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  await getAdminContext()
  const { id } = await params

  const supabase = await createServiceClient()

  const [productRes, companionsRes] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('product_companions')
      .select('id, companion_product_id, sort_order')
      .eq('product_id', id)
      .order('sort_order'),
  ])

  const product = productRes.data
  if (!product) notFound()

  // Fetch companion product names
  const companionIds = (companionsRes.data ?? []).map((c) => c.companion_product_id)
  let companionNames: Record<string, string> = {}
  if (companionIds.length > 0) {
    const { data: nameRows } = await supabase
      .from('products')
      .select('id, name')
      .in('id', companionIds)
    companionNames = Object.fromEntries((nameRows ?? []).map((p) => [p.id, p.name]))
  }

  const companions = (companionsRes.data ?? []).map((c) => ({
    id: c.id as string,
    companion_product_id: c.companion_product_id as string,
    companion_name: companionNames[c.companion_product_id] ?? 'Unknown',
    sort_order: c.sort_order as number,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/product-management"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#061f3f] mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to products
        </Link>
        <h1 className="text-3xl font-extrabold text-[#061f3f]">Edit Product</h1>
        <p className="text-gray-500 mt-1 font-mono text-sm">{product.slug}</p>
      </div>

      <ProductForm mode="edit" product={product} />

      <CompanionEditor productId={id} companions={companions} />
    </div>
  )
}
