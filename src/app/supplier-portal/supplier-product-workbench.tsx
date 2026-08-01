/* Hallmark · pre-emit critique: P4 H5 E4 S5 R4 V4 */
'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Package, Search, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProductEditorDialog, type SupplierProductValue } from './portal-dialogs'

export type SupplierManagedProduct = SupplierProductValue & {
  created_at: string
  product_status: string | null
}

type SortOption = 'newest' | 'name-asc' | 'stock-asc' | 'stock-desc' | 'price-asc' | 'price-desc'

const selectClassName = 'h-11 w-full appearance-none rounded-lg border border-[#d8e0ea] bg-white px-3 pr-9 text-sm font-bold text-[#334155] outline-none transition-colors focus-visible:border-[#ff5f14] focus-visible:ring-4 focus-visible:ring-[#ff5f14]/10'

function SelectControl({ label, value, onChange, children }: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={selectClassName}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#728196]" />
    </label>
  )
}

function stockState(stock: number) {
  if (stock === 0) return { key: 'out', label: 'Out of stock', className: 'bg-red-100 text-red-700' }
  if (stock < 20) return { key: 'low', label: 'Low stock', className: 'bg-amber-100 text-amber-800' }
  return { key: 'in', label: 'In stock', className: 'bg-emerald-100 text-emerald-700' }
}

function visibilityState(product: SupplierManagedProduct) {
  if (product.product_status === 'paused_by_admin') return { label: 'Paused by Bewama', className: 'bg-red-100 text-red-700' }
  return product.is_active
    ? { label: 'Visible', className: 'bg-emerald-100 text-emerald-700' }
    : { label: 'Draft', className: 'bg-slate-100 text-slate-600' }
}

function formatPrice(product: SupplierManagedProduct) {
  if (product.pricing_type === 'quote') return 'Quote only'
  return `${product.currency || 'KES'} ${Number(product.price ?? 0).toLocaleString()}`
}

function ProductIdentity({ product }: { product: SupplierManagedProduct }) {
  const thumbnail = product.images?.[0]
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#d8e0ea] bg-[#f7f9fb]">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : <Package aria-hidden="true" className="h-5 w-5 text-[#a4afbc]" />}
      </div>
      <div className="min-w-0">
        <p className="truncate font-extrabold text-[#061f3f]">{product.name}</p>
        <p className="truncate font-mono text-xs text-[#728196]">{product.supplier_sku || product.slug}</p>
      </div>
    </div>
  )
}

export default function SupplierProductWorkbench({ products }: { products: SupplierManagedProduct[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [visibility, setVisibility] = useState('all')
  const [stock, setStock] = useState('all')
  const [sort, setSort] = useState<SortOption>('newest')

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category?.trim()).filter(Boolean) as string[])].sort(),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      const haystack = [product.name, product.supplier_sku, product.slug, product.category, product.brand].filter(Boolean).join(' ').toLowerCase()
      const currentVisibility = product.product_status === 'paused_by_admin' ? 'paused' : product.is_active ? 'visible' : 'draft'
      return (!term || haystack.includes(term))
        && (category === 'all' || product.category === category)
        && (visibility === 'all' || currentVisibility === visibility)
        && (stock === 'all' || stockState(Number(product.stock ?? 0)).key === stock)
    }).sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'stock-asc': return Number(a.stock ?? 0) - Number(b.stock ?? 0)
        case 'stock-desc': return Number(b.stock ?? 0) - Number(a.stock ?? 0)
        case 'price-asc': return Number(a.price ?? 0) - Number(b.price ?? 0)
        case 'price-desc': return Number(b.price ?? 0) - Number(a.price ?? 0)
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [category, products, search, sort, stock, visibility])

  const hasFilters = Boolean(search || category !== 'all' || visibility !== 'all' || stock !== 'all' || sort !== 'newest')
  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setVisibility('all')
    setStock('all')
    setSort('newest')
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-[#d8e0ea] shadow-sm">
      <div className="border-b border-[#e7ecf1] bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0 text-[#ff5f14]" />
            <p className="truncate text-sm font-extrabold text-[#061f3f]">{filteredProducts.length} of {products.length} products</p>
          </div>
          {hasFilters && (
            <Button type="button" variant="ghost" onClick={clearFilters} className="h-10 shrink-0 whitespace-nowrap px-3 font-bold text-[#4b5a6a] hover:bg-[#fff3ec] hover:text-[#c94306]">
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(4,minmax(140px,0.8fr))]">
          <label className="relative block sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Search your products</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#728196]" />
            <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, brand…" className="h-11 rounded-lg border-[#d8e0ea] pl-10 pr-10 font-semibold focus-visible:border-[#ff5f14] focus-visible:ring-[#ff5f14]/15" />
          </label>
          <SelectControl label="Filter products by category" value={category} onChange={setCategory}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </SelectControl>
          <SelectControl label="Filter products by visibility" value={visibility} onChange={setVisibility}>
            <option value="all">All visibility</option>
            <option value="visible">Visible</option>
            <option value="draft">Drafts</option>
            <option value="paused">Paused by Bewama</option>
          </SelectControl>
          <SelectControl label="Filter products by stock level" value={stock} onChange={setStock}>
            <option value="all">All stock levels</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </SelectControl>
          <SelectControl label="Sort products" value={sort} onChange={(value) => setSort(value as SortOption)}>
            <option value="newest">Newest first</option>
            <option value="name-asc">Name A–Z</option>
            <option value="stock-asc">Stock: low first</option>
            <option value="stock-desc">Stock: high first</option>
            <option value="price-asc">Price: low first</option>
            <option value="price-desc">Price: high first</option>
          </SelectControl>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-[#a4afbc]" />
          <h3 className="font-extrabold text-[#061f3f]">No products match these filters</h3>
          <p className="mt-1 text-sm font-medium text-[#728196]">Clear a filter or try a broader product name or SKU.</p>
          <Button type="button" variant="outline" onClick={clearFilters} className="mt-5 h-11 whitespace-nowrap font-bold">Clear filters</Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[#e7ecf1] lg:hidden">
            {filteredProducts.map((product) => {
              const stockInfo = stockState(Number(product.stock ?? 0))
              const visibilityInfo = visibilityState(product)
              return (
                <article key={product.id} className="p-4 sm:p-5">
                  <ProductIdentity product={product} />
                  <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#f7f9fb] p-3 text-sm">
                    <div><dt className="text-xs font-bold text-[#728196]">Category</dt><dd className="mt-0.5 truncate font-extrabold text-[#334155]">{product.category ?? 'Uncategorised'}</dd></div>
                    <div><dt className="text-xs font-bold text-[#728196]">Brand</dt><dd className="mt-0.5 truncate font-extrabold text-[#334155]">{product.brand ?? 'No brand'}</dd></div>
                    <div><dt className="text-xs font-bold text-[#728196]">Stock</dt><dd className="mt-0.5 font-extrabold text-[#061f3f]">{Number(product.stock ?? 0)} · {stockInfo.label}</dd></div>
                    <div><dt className="text-xs font-bold text-[#728196]">Price</dt><dd className="mt-0.5 truncate font-extrabold text-[#061f3f]">{formatPrice(product)}</dd></div>
                  </dl>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Badge className={`border-none px-2.5 py-1 text-xs font-bold ${visibilityInfo.className}`}>{visibilityInfo.label}</Badge>
                    <ProductEditorDialog product={product} />
                  </div>
                </article>
              )
            })}
          </div>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-[#d8e0ea] bg-[#f7f9fb] text-xs font-extrabold uppercase tracking-wider text-[#5f6f81]">
                <tr><th className="px-6 py-4">Product</th><th className="px-6 py-4">Category / brand</th><th className="px-6 py-4 text-center">Stock</th><th className="px-6 py-4 text-center">Visibility</th><th className="px-6 py-4 text-right">Price</th><th className="px-6 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f5] text-sm">
                {filteredProducts.map((product) => {
                  const stockInfo = stockState(Number(product.stock ?? 0))
                  const visibilityInfo = visibilityState(product)
                  return (
                    <tr key={product.id} className="hover:bg-[#fafbfd]">
                      <td className="px-6 py-4"><ProductIdentity product={product} /></td>
                      <td className="px-6 py-4"><p className="font-bold text-[#334155]">{product.category ?? 'Uncategorised'}</p><p className="mt-0.5 text-xs font-medium text-[#728196]">{product.brand ?? 'No brand'}</p></td>
                      <td className="px-6 py-4 text-center"><p className="font-extrabold tabular-nums text-[#061f3f]">{Number(product.stock ?? 0)}</p><Badge className={`mt-1 border-none px-2 py-0.5 text-[10px] font-bold ${stockInfo.className}`}>{stockInfo.label}</Badge></td>
                      <td className="px-6 py-4 text-center"><Badge className={`border-none px-2.5 py-1 text-xs font-bold ${visibilityInfo.className}`}>{visibilityInfo.label}</Badge></td>
                      <td className="px-6 py-4 text-right font-extrabold tabular-nums text-[#061f3f]">{formatPrice(product)}</td>
                      <td className="px-6 py-4 text-right"><ProductEditorDialog product={product} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}
