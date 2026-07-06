import { getAdminContext } from '@/lib/auth'
import ProductForm from '../product-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProductPage() {
  await getAdminContext()

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
        <h1 className="text-3xl font-extrabold text-[#061f3f]">New Product</h1>
        <p className="text-gray-500 mt-1">Add a new product to the catalog.</p>
      </div>

      <ProductForm mode="create" />
    </div>
  )
}
