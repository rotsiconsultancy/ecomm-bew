import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { createBuildClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { Package, FileText, Search } from 'lucide-react'
import { Pagination } from '@/components/pagination-ui'
import { getFirstSafeImageSrc } from '@/lib/images'
import { ProductFilters } from './product-filters'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://bewama.com'
const ITEMS_PER_PAGE = 12
const CURRENCY_SYMBOLS: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }

type SearchParams = {
  category?: string
  brand?: string
  q?: string
  page?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const { category, brand, q, page } = params

  const canonicalParams = new URLSearchParams()
  if (category) canonicalParams.set('category', category)
  if (brand) canonicalParams.set('brand', brand)
  if (q) canonicalParams.set('q', q)
  if (page && parseInt(page, 10) > 1) canonicalParams.set('page', page)

  const qs = canonicalParams.toString()
  const canonical = `${SITE_URL}/products${qs ? `?${qs}` : ''}`
  const titleSuffix = category ? ` - ${category}` : brand ? ` - ${brand}` : q ? ` - ${q}` : ''

  return {
    title: `Products${titleSuffix} | Bewama`,
    description:
      'Browse Bewama construction materials, sealants, adhesives, abrasives, and industrial supplies. Add stocked items to cart or request a bulk quote.',
    alternates: { canonical },
    openGraph: {
      title: `Products${titleSuffix} | Bewama`,
      description: 'Browse Bewama construction materials and request bulk sourcing quotes.',
      type: 'website',
      url: canonical,
      images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Products${titleSuffix} | Bewama`,
      description: 'Browse Bewama construction materials and request bulk sourcing quotes.',
    },
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const category = params.category
  const brand = params.brand
  const q = params.q?.trim()
  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const supabase = createBuildClient()

  let query = supabase
    .from('products')
    .select('id, name, slug, category, brand, price, currency, pricing_type, stock, images, is_active', { count: 'exact' })
    .eq('is_active', true)
    .or('product_status.is.null,product_status.eq.active')
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (brand) query = query.ilike('brand', `%${brand}%`)
  if (q) query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%,brand.ilike.%${q}%`)

  const [{ data: products, count }, { data: allProducts }] = await Promise.all([
    query.range(from, to),
    supabase
      .from('products')
      .select('category, brand')
      .eq('is_active', true)
      .or('product_status.is.null,product_status.eq.active'),
  ])

  const all = products ?? []
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const catalogRows = allProducts ?? []
  const categories = [...new Set(catalogRows.map((p) => p.category).filter(Boolean))] as string[]
  const brands = [...new Set(catalogRows.map((p) => p.brand).filter(Boolean))] as string[]
  const hasFilters = Boolean(category || brand || q)
  const categoryOptions = categories.map((name) => ({
    name,
    count: catalogRows.filter((product) => product.category === name).length,
  }))

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <section className="bg-[#03152d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Product catalog</p>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
                Search, compare, cart, or quote.
              </h1>
              {/* <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/70">
                Use the live Bewama catalog to buy stocked materials quickly or move bulk,
                project, and uncertain requirements into RFQ.
              </p> */}
            </div>
            <form action="/products" className="rounded-lg border border-white/15 bg-white p-2 shadow-2xl shadow-black/20">
              <label className="sr-only" htmlFor="catalog-search">Search catalog</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  id="catalog-search"
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search product, brand, or category..."
                  className="min-h-12 min-w-0 rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] px-4 text-sm font-bold text-[#182333] outline-none focus:border-[#ff5f14] focus:bg-white focus:ring-4 focus:ring-[#ff5f14]/10"
                />
                <button className="grid h-12 w-12 place-items-center rounded-lg bg-[#ff5f14] text-white transition-colors hover:bg-[#e84f0a]" aria-label="Search">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-7 sm:px-6 sm:py-10 lg:grid-cols-[280px_1fr] lg:px-8">
        <ProductFilters
          categories={categoryOptions}
          brands={brands}
          category={category}
          brand={brand}
          hasFilters={hasFilters}
          totalCatalogCount={catalogRows.length}
          display="desktop"
        />

        <main className="min-w-0">
          <div className="mb-5 flex items-end justify-between gap-2 sm:mb-6 sm:gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#e84f0a]">Live inventory</p>
              <h2 className="mt-1 text-2xl font-black text-[#061f3f] sm:text-3xl">
                {hasFilters ? 'Filtered products' : 'All products'}
              </h2>
              <p className="mt-1 text-sm font-bold text-[#728196]">
                {all.length === 0 ? 'No products match your filters.' : `${totalCount} product${totalCount === 1 ? '' : 's'} available`}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <ProductFilters
                categories={categoryOptions}
                brands={brands}
                category={category}
                brand={brand}
                hasFilters={hasFilters}
                totalCatalogCount={catalogRows.length}
                display="mobile"
              />
              {q && (
                <span className="hidden max-w-48 truncate rounded-full border border-[#d8e0ea] bg-white px-3 py-1 text-xs font-black text-[#061f3f] sm:inline-flex">
                  Search: {q}
                </span>
              )}
            </div>
          </div>

          {all.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#d8e0ea] bg-white px-6 py-20 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-[#728196]" />
              <h3 className="text-xl font-black text-[#061f3f]">No products found.</h3>
              <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[#4b5a6a]">
                Try another category, remove filters, or send the sourcing request through RFQ.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline" className="rounded-lg border-[#061f3f]/25 font-black text-[#061f3f]">
                  <Link href="/products">Clear filters</Link>
                </Button>
                <Button asChild className="rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
                  <Link href="/request-quote">Request Quote</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {all.map((product) => {
                  const thumb = getFirstSafeImageSrc(product.images)
                  const symbol = CURRENCY_SYMBOLS[product.currency] ?? `${product.currency} `
                  const inStock = product.stock > 0
                  const isQuote = product.pricing_type === 'quote'

                  return (
                    <article
                      key={product.id}
                      className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-[#d8e0ea] bg-white shadow-[0_1px_0_rgba(3,21,45,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff5f14]/40 hover:shadow-2xl hover:shadow-[#03152d]/10"
                    >
                      <Link href={`/products/${product.slug}`} className="relative grid aspect-square place-items-center overflow-hidden bg-linear-to-br from-[#f9fbfd] to-[#edf2f7] p-6">
                        <span className="absolute left-3 top-3 z-10 rounded-full border border-[#d8e0ea] bg-white/95 px-2.5 py-1 text-[11px] font-black text-[#061f3f]">
                          {isQuote ? 'RFQ' : inStock ? 'In stock' : 'Check stock'}
                        </span>
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={product.name}
                            fill
                            className="object-contain p-6 drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                          />
                        ) : (
                          <Package className="h-14 w-14 text-[#728196]" />
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col p-4">
                        {product.category && (
                          <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#e84f0a]">
                            {product.category}
                          </p>
                        )}
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="min-h-12 text-base font-black leading-snug text-[#061f3f] transition-colors hover:text-[#e84f0a]">
                            {product.name}
                          </h3>
                        </Link>
                        {product.brand && <p className="mt-1 text-xs font-bold text-[#728196]">{product.brand}</p>}

                        <div className="mt-auto pt-4">
                          <div className="mb-3 flex items-end justify-between gap-3">
                            {isQuote ? (
                              <span className="text-lg font-black text-[#e84f0a]">Price on Request</span>
                            ) : (
                              <span className="text-xl font-black text-[#061f3f]">
                                {symbol}{product.price.toLocaleString()}
                              </span>
                            )}
                            <span className={inStock || isQuote ? 'text-xs font-black text-[#3b7a57]' : 'text-xs font-black text-[#b83b32]'}>
                              {isQuote ? 'Quote' : inStock ? 'Stocked' : 'Out'}
                            </span>
                          </div>

                          <div className="grid grid-cols-[1fr_44px] gap-2">
                            {isQuote || !inStock ? (
                              <Button asChild size="sm" className="h-10 rounded-lg bg-[#ff5f14] text-xs font-black text-white hover:bg-[#e84f0a]">
                                <Link href={`/request-quote?product=${encodeURIComponent(product.name)}`}>
                                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                                  Request Quote
                                </Link>
                              </Button>
                            ) : (
                              <AddToCartButton
                                product={{
                                  id: product.id,
                                  name: product.name,
                                  slug: product.slug,
                                  price: product.price,
                                  currency: product.currency,
                                  image: thumb,
                                }}
                                size="sm"
                                className="h-10 rounded-lg text-xs font-black"
                              />
                            )}
                            <Button asChild size="sm" variant="outline" className="h-10 rounded-lg border-[#d8e0ea] px-0 text-[#061f3f] hover:border-[#ff5f14] hover:bg-[#fff8f4]">
                              <Link href={`/request-quote?product=${encodeURIComponent(product.name)}`} aria-label={`Request quote for ${product.name}`}>
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/products"
                searchParams={params}
              />
            </>
          )}
        </main>
      </section>
    </div>
  )
}
