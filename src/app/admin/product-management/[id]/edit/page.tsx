import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminContext } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import ProductForm from '../../product-form'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  await getAdminContext()
  const { id } = await params

  const supabase = await createServiceClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!product) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/product-management"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#003366] mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to products
        </Link>
        <h1 className="text-3xl font-extrabold text-[#003366]">Edit Product</h1>
        <p className="text-gray-500 mt-1 font-mono text-sm">{product.slug}</p>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  )
}
