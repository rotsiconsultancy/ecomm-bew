import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { createBuildClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { Package, FileText } from 'lucide-react'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Products | Bewama',
  description:
    'Browse our industrial product catalog — silicones, timber, adhesives, tools and more. Quality materials sourced for professionals across Europe.',
  alternates: { canonical: '/products' },
}

type SearchParams = {
  category?: string
  brand?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

const CURRENCY_SYMBOLS: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }

export default async function ProductsPage({ searchParams }: Props) {
  const { category, brand } = await searchParams
  const supabase = createBuildClient()

  let query = supabase
    .from('products')
    .select('id, name, slug, category, brand, price, currency, pricing_type, stock, images, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (brand)    query = query.ilike('brand', `%${brand}%`)

  const { data: products } = await query
  const all = products ?? []

  const { data: allProducts } = await supabase
    .from('products')
    .select('category, brand')
    .eq('is_active', true)

  const categories = [...new Set((allProducts ?? []).map((p) => p.category).filter(Boolean))] as string[]
  const brands     = [...new Set((allProducts ?? []).map((p) => p.brand).filter(Boolean))] as string[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#003366] mb-2">Product Catalog</h1>
        <p className="text-gray-500">
          {all.length === 0 && (category || brand)
            ? 'No products match your filters.'
            : `${all.length} product${all.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-8">
          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#003366] uppercase tracking-widest mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                <Link
                  href="/products"
                  className={`flex items-center justify-between text-sm py-1 transition-colors ${
                    !category ? 'text-[#ec5b13] font-semibold' : 'text-gray-600 hover:text-[#ec5b13]'
                  }`}
                >
                  All Categories
                  <Badge variant="secondary" className="text-xs">{(allProducts ?? []).length}</Badge>
                </Link>
                {categories.map((cat) => {
                  const count = (allProducts ?? []).filter((p) => p.category === cat).length
                  return (
                    <Link
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      className={`flex items-center justify-between text-sm py-1 transition-colors ${
                        category === cat
                          ? 'text-[#ec5b13] font-semibold'
                          : 'text-gray-600 hover:text-[#ec5b13]'
                      }`}
                    >
                      {cat}
                      <Badge
                        className={`text-xs border-none ${category === cat ? 'bg-[#ec5b13] text-white' : ''}`}
                        variant={category === cat ? 'default' : 'secondary'}
                      >
                        {count}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#003366] uppercase tracking-widest mb-4">
                Brands
              </h3>
              <div className="space-y-2">
                {brands.map((b) => (
                  <Link
                    key={b}
                    href={`/products?brand=${encodeURIComponent(b)}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                    className={`block text-sm py-1 transition-colors ${
                      brand?.toLowerCase() === b.toLowerCase()
                        ? 'text-[#ec5b13] font-semibold'
                        : 'text-gray-600 hover:text-[#ec5b13]'
                    }`}
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(category || brand) && (
            <Link href="/products">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Clear filters
              </Button>
            </Link>
          )}
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {all.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-medium">No products found.</p>
              {(category || brand) && (
                <Link href="/products" className="mt-3 inline-block text-sm text-[#ec5b13] hover:underline">
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {all.map((product) => {
                const thumb       = product.images?.[0] ?? null
                const symbol      = CURRENCY_SYMBOLS[product.currency] ?? product.currency + ' '
                const inStock     = product.stock > 0
                const isQuote     = product.pricing_type === 'quote'

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                  >
                    {/* Image */}
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="bg-gray-50 rounded-t-xl aspect-square flex items-center justify-center overflow-hidden">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Package className="w-16 h-16 text-gray-200" />
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      {product.category && (
                        <Badge className="self-start mb-2 text-xs bg-orange-50 text-orange-700 border-none font-semibold">
                          {product.category}
                        </Badge>
                      )}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-[#003366] line-clamp-2 hover:text-[#ec5b13] transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </Link>
                      {product.brand && (
                        <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
                      )}

                      <div className="mt-auto pt-4">
                        {/* Price */}
                        <div className="mb-3">
                          {isQuote ? (
                            <span className="text-lg font-extrabold text-[#ec5b13]">Price on Request</span>
                          ) : (
                            <>
                              <span className="text-xl font-extrabold text-[#003366]">
                                {symbol}{product.price.toLocaleString()}
                              </span>
                              {!inStock && (
                                <p className="text-xs text-red-500 font-semibold mt-0.5">Out of stock</p>
                              )}
                            </>
                          )}
                        </div>

                        {/* CTAs */}
                        <div className="flex items-center gap-2">
                          {isQuote ? (
                            <Link
                              href={`/request-quote?product=${encodeURIComponent(product.name)}`}
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                className="w-full bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-xs h-9"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                Request Quote
                              </Button>
                            </Link>
                          ) : (
                            <>
                              <AddToCartButton
                                product={{ id: product.id, name: product.name, slug: product.slug, price: product.price, currency: product.currency, image: thumb }}
                                size="sm"
                                className="flex-1 text-xs h-9"
                              />
                              <Link href={`/request-quote?product=${encodeURIComponent(product.name)}`}>
                                <Button size="sm" variant="outline" title="Request a Quote" className="text-xs h-9 text-[#003366] border-[#003366]">
                                  <FileText className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
