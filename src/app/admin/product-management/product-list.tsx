'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  Edit2,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import DeleteProductButton from './delete-product-button'
import DuplicateProductButton from './duplicate-product-button'
import ToggleStatusButton from './toggle-status-button'

export type ManagedProduct = {
  id: string
  name: string
  slug: string
  category: string | null
  brand: string | null
  price: number
  currency: string
  stock: number
  images: string[] | null
  is_active: boolean
  created_at: string
}

type SortOption = 'newest' | 'name-asc' | 'stock-asc' | 'stock-desc' | 'price-asc' | 'price-desc'

const selectClassName = 'h-11 w-full appearance-none rounded-lg border border-[#d8e0ea] bg-white px-3 pr-9 text-sm font-bold text-[#334155] outline-none transition-colors focus-visible:border-[#ff5f14] focus-visible:ring-4 focus-visible:ring-[#ff5f14]/10 disabled:cursor-not-allowed disabled:opacity-50'

function SelectControl({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClassName}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#728196]" />
    </label>
  )
}

function getStockState(stock: number) {
  if (stock === 0) return { key: 'out', label: 'Out of stock', className: 'bg-red-100 text-red-700' }
  if (stock < 20) return { key: 'low', label: 'Low stock', className: 'bg-amber-100 text-amber-800' }
  return { key: 'in', label: 'In stock', className: 'bg-emerald-100 text-emerald-700' }
}

function formatPrice(price: number, currency: string) {
  const symbols: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }
  return `${symbols[currency] ?? `${currency} `}${price.toLocaleString()}`
}

export default function ProductList({ products }: { products: ManagedProduct[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [brand, setBrand] = useState('all')
  const [visibility, setVisibility] = useState('all')
  const [stock, setStock] = useState('all')
  const [sort, setSort] = useState<SortOption>('newest')

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category?.trim()).filter(Boolean) as string[])].sort(),
    [products],
  )
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand?.trim()).filter(Boolean) as string[])].sort(),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const haystack = [product.name, product.slug, product.category, product.brand]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const stockState = getStockState(product.stock).key

      return (
        (!term || haystack.includes(term)) &&
        (category === 'all' || product.category === category) &&
        (brand === 'all' || product.brand === brand) &&
        (visibility === 'all' || (visibility === 'active' ? product.is_active : !product.is_active)) &&
        (stock === 'all' || stockState === stock)
      )
    })

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'stock-asc': return a.stock - b.stock
        case 'stock-desc': return b.stock - a.stock
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [brand, category, products, search, sort, stock, visibility])

  const hasFilters = Boolean(
    search || category !== 'all' || brand !== 'all' || visibility !== 'all' || stock !== 'all' || sort !== 'newest',
  )

  function clearFilters() {
    setSearch('')
    setCategory('all')
    setBrand('all')
    setVisibility('all')
    setStock('all')
    setSort('newest')
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-[#d8e0ea] shadow-sm">
      <div className="border-b border-[#e7ecf1] bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#ff5f14]" />
            <p className="truncate text-sm font-extrabold text-[#061f3f]">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={clearFilters}
              className="h-10 shrink-0 px-3 font-bold text-[#4b5a6a] hover:bg-[#fff3ec] hover:text-[#c94306]"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(5,minmax(132px,0.8fr))]">
          <label className="relative block md:col-span-2 xl:col-span-1">
            <span className="sr-only">Search products</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#728196]" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, SKU, brand…"
              className="h-11 rounded-lg border-[#d8e0ea] bg-white pl-10 pr-10 font-semibold focus-visible:border-[#ff5f14] focus-visible:ring-[#ff5f14]/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear product search"
                className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-[#728196] hover:bg-[#f4f7fa] hover:text-[#061f3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <SelectControl label="Filter by category" value={category} onChange={setCategory}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </SelectControl>
          <SelectControl label="Filter by brand" value={brand} onChange={setBrand}>
            <option value="all">All brands</option>
            {brands.map((item) => <option key={item} value={item}>{item}</option>)}
          </SelectControl>
          <SelectControl label="Filter by visibility" value={visibility} onChange={setVisibility}>
            <option value="all">All visibility</option>
            <option value="active">Visible</option>
            <option value="inactive">Hidden</option>
          </SelectControl>
          <SelectControl label="Filter by stock" value={stock} onChange={setStock}>
            <option value="all">All stock</option>
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
        <div className="px-6 py-16 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-[#a4afbc]" />
          <h3 className="font-extrabold text-[#061f3f]">No products match these filters.</h3>
          <p className="mt-1 text-sm font-medium text-[#728196]">Clear a filter or try a broader search.</p>
          <Button type="button" variant="outline" onClick={clearFilters} className="mt-5 h-11 border-[#061f3f]/20 font-bold text-[#061f3f]">
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[#e7ecf1] lg:hidden">
            {filteredProducts.map((product) => (
              <ProductMobileCard key={product.id} product={product} />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-[#d8e0ea] bg-[#f7f9fb] text-xs font-extrabold uppercase tracking-wider text-[#5f6f81]">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category / Brand</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Visibility</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f5] text-sm">
                {filteredProducts.map((product) => <ProductTableRow key={product.id} product={product} />)}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}

function ProductIdentity({ product }: { product: ManagedProduct }) {
  const thumb = product.images?.[0]
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#d8e0ea] bg-[#f7f9fb]">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <Package className="h-5 w-5 text-[#a4afbc]" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-extrabold text-[#061f3f]">{product.name}</p>
        <p className="truncate font-mono text-xs text-[#728196]">{product.slug}</p>
      </div>
    </div>
  )
}

function ProductActions({ product }: { product: ManagedProduct }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ToggleStatusButton id={product.id} isActive={product.is_active} />
      <DuplicateProductButton id={product.id} name={product.name} />
      <Link
        href={`/admin/product-management/${product.id}/edit`}
        aria-label={`Edit ${product.name}`}
        title={`Edit ${product.name}`}
        className="grid h-11 w-11 place-items-center rounded-lg text-[#64748b] hover:bg-[#fff3ec] hover:text-[#c94306] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14]"
      >
        <Edit2 className="h-4 w-4" />
      </Link>
      <DeleteProductButton id={product.id} name={product.name} />
    </div>
  )
}

function ProductTableRow({ product }: { product: ManagedProduct }) {
  const stockState = getStockState(product.stock)
  return (
    <tr className="group hover:bg-[#fafbfd]">
      <td className="px-6 py-4"><ProductIdentity product={product} /></td>
      <td className="px-6 py-4">
        <p className="font-bold text-[#334155]">{product.category ?? 'Uncategorised'}</p>
        <p className="mt-0.5 text-xs font-medium text-[#728196]">{product.brand ?? 'No brand'}</p>
      </td>
      <td className="px-6 py-4 text-center">
        <p className="font-extrabold tabular-nums text-[#061f3f]">{product.stock}</p>
        <Badge className={`mt-1 border-none px-2 py-0.5 text-[10px] font-bold ${stockState.className}`}>{stockState.label}</Badge>
      </td>
      <td className="px-6 py-4 text-center">
        <Badge className={`border-none px-2.5 py-1 text-xs font-bold ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {product.is_active ? 'Visible' : 'Hidden'}
        </Badge>
      </td>
      <td className="px-6 py-4 text-right font-extrabold tabular-nums text-[#061f3f]">{formatPrice(product.price, product.currency)}</td>
      <td className="px-6 py-4"><ProductActions product={product} /></td>
    </tr>
  )
}

function ProductMobileCard({ product }: { product: ManagedProduct }) {
  const stockState = getStockState(product.stock)
  return (
    <article className="p-4 sm:p-5">
      <ProductIdentity product={product} />
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-[#f7f9fb] p-3 text-sm">
        <div>
          <dt className="text-xs font-bold text-[#728196]">Category</dt>
          <dd className="mt-0.5 truncate font-extrabold text-[#334155]">{product.category ?? 'Uncategorised'}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-[#728196]">Brand</dt>
          <dd className="mt-0.5 truncate font-extrabold text-[#334155]">{product.brand ?? 'No brand'}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-[#728196]">Stock</dt>
          <dd className="mt-0.5 flex items-center gap-2 font-extrabold tabular-nums text-[#061f3f]">
            {product.stock}
            <span className={`rounded px-1.5 py-0.5 text-[10px] ${stockState.className}`}>{stockState.label}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-[#728196]">Price</dt>
          <dd className="mt-0.5 font-extrabold tabular-nums text-[#061f3f]">{formatPrice(product.price, product.currency)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Badge className={`border-none px-2.5 py-1 text-xs font-bold ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {product.is_active ? 'Visible' : 'Hidden'}
        </Badge>
        <ProductActions product={product} />
      </div>
    </article>
  )
}
