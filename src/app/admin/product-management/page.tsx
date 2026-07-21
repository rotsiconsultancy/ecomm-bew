import Link from 'next/link'
import { getAdminContext } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ProductList, { type ManagedProduct } from './product-list'
import {
  Package, Plus, TrendingDown, AlertCircle,
} from 'lucide-react'

export default async function ProductManagementPage() {
  await getAdminContext()
  const supabase = await createServiceClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, category, brand, price, currency, stock, images, is_active, created_at')
    .order('created_at', { ascending: false })

  const all       = products ?? []
  const total     = all.length
  const active    = all.filter((p) => p.is_active).length
  const outOfStock = all.filter((p) => p.stock === 0).length

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#061f3f] tracking-tight">Product Management</h1>
          <p className="text-gray-500 mt-2">Manage your inventory, pricing, and product details.</p>
        </div>
        <Link href="/admin/product-management/new">
          <Button className="bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold h-12 px-8">
            <Plus className="mr-2 h-5 w-5" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Products</p>
            <p className="text-2xl font-extrabold text-[#061f3f]">{total}</p>
            <p className="text-xs text-gray-400">{active} active</p>
          </div>
        </Card>

        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Out of Stock</p>
            <p className="text-2xl font-extrabold text-[#061f3f]">{outOfStock}</p>
            <p className="text-xs text-gray-400">Need restocking</p>
          </div>
        </Card>

        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-orange-100 text-[#ff5f14] rounded-full flex items-center justify-center shrink-0">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inactive</p>
            <p className="text-2xl font-extrabold text-[#061f3f]">{total - active}</p>
            <p className="text-xs text-gray-400">Hidden from store</p>
          </div>
        </Card>
      </div>

      {/* Product workbench */}
      {all.length === 0 ? (
        <Card className="rounded-xl border-none shadow-sm p-16 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No products yet.</p>
          <Link href="/admin/product-management/new" className="mt-4 inline-block">
            <Button className="bg-[#ff5f14] hover:bg-[#e84f0a] text-white mt-4">
              <Plus className="w-4 h-4 mr-2" /> Add your first product
            </Button>
          </Link>
        </Card>
      ) : (
        <ProductList products={all as ManagedProduct[]} />
      )}
    </div>
  )
}
