import Link from 'next/link'
import { getAdminContext } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DeleteProductButton from './delete-product-button'
import ToggleStatusButton from './toggle-status-button'
import {
  Package, Plus, Edit2, TrendingDown, AlertCircle,
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

  const formatPrice = (price: number, currency: string) => {
    const symbols: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }
    return `${symbols[currency] ?? currency} ${price.toLocaleString()}`
  }

  const stockBadge = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-600' }
    if (stock < 20)  return { label: 'Low Stock',    cls: 'bg-yellow-100 text-yellow-600' }
    return               { label: 'In Stock',       cls: 'bg-green-100 text-green-600' }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#003366] tracking-tight">Product Management</h1>
          <p className="text-gray-500 mt-2">Manage your inventory, pricing, and product details.</p>
        </div>
        <Link href="/admin/product-management/new">
          <Button className="bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-bold h-12 px-8">
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
            <p className="text-2xl font-extrabold text-[#003366]">{total}</p>
            <p className="text-xs text-gray-400">{active} active</p>
          </div>
        </Card>

        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Out of Stock</p>
            <p className="text-2xl font-extrabold text-[#003366]">{outOfStock}</p>
            <p className="text-xs text-gray-400">Need restocking</p>
          </div>
        </Card>

        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-orange-100 text-[#ec5b13] rounded-full flex items-center justify-center shrink-0">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inactive</p>
            <p className="text-2xl font-extrabold text-[#003366]">{total - active}</p>
            <p className="text-xs text-gray-400">Hidden from store</p>
          </div>
        </Card>
      </div>

      {/* Product Table */}
      {all.length === 0 ? (
        <Card className="rounded-xl border-none shadow-sm p-16 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No products yet.</p>
          <Link href="/admin/product-management/new" className="mt-4 inline-block">
            <Button className="bg-[#ec5b13] hover:bg-[#d14d0d] text-white mt-4">
              <Plus className="w-4 h-4 mr-2" /> Add your first product
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="rounded-xl border-none shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category / Brand</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {all.map((product) => {
                const badge = stockBadge(product.stock)
                const thumb = product.images?.[0]
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-50 rounded-lg border flex items-center justify-center shrink-0 overflow-hidden">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#003366] group-hover:text-[#ec5b13] transition-colors line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-gray-700">{product.category ?? '—'}</p>
                      <p className="text-xs text-gray-400">{product.brand ?? ''}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-extrabold text-[#003366]">{product.stock}</span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              product.stock === 0 ? 'bg-red-400 w-0' :
                              product.stock < 20  ? 'bg-yellow-400 w-1/4' :
                              product.stock < 100 ? 'bg-blue-400 w-1/2' :
                              'bg-green-400 w-full'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center gap-1.5">
                        <Badge className={`border-none text-xs font-bold px-3 py-1 ${badge.cls}`}>
                          {badge.label}
                        </Badge>
                        <Badge className={`border-none text-[10px] font-semibold px-2 py-0.5 ${
                          product.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-extrabold text-[#003366]">
                      {formatPrice(product.price, product.currency)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ToggleStatusButton id={product.id} isActive={product.is_active} />
                        <Link href={`/admin/product-management/${product.id}/edit`}>
                          <button className="p-2 text-slate-400 hover:text-[#ec5b13] transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <DeleteProductButton id={product.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
