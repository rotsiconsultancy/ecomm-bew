import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { createBuildClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { getFirstSafeImageSrc } from '@/lib/images'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Package,
  Shield,
  Truck,
} from 'lucide-react'

const SITE_URL = 'https://bewama.com'
const CURRENCY_SYMBOLS: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bewama | Construction Materials, Adhesives & Industrial Supplies',
  description: 'Browse stocked construction materials, adhesives, sealants, abrasives, and industrial supplies from Bewama, or request a bulk project quote.',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: 'Bewama | Construction Materials, Adhesives & Industrial Supplies',
    description: 'Browse stocked materials or request a bulk sourcing quote from Bewama.',
    type: 'website',
    url: `${SITE_URL}/`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bewama | Construction Materials, Adhesives & Industrial Supplies',
    description: 'Browse stocked materials or request a bulk sourcing quote from Bewama.',
    images: [`${SITE_URL}/logo.png`],
  },
}

const proofItems = [
  'Stocked items can be added to cart immediately.',
  'Bulk and project orders can go straight to RFQ.',
  'Our team confirms availability, delivery timing, and alternatives.',
]

const trustItems = [
  { icon: Truck, title: 'Delivery coordination', copy: 'Share location and timing for practical delivery planning.' },
  { icon: Shield, title: 'Known material categories', copy: 'Shop adhesives, sealants, abrasives, PU foam, and chemicals.' },
  { icon: Clock, title: 'Quote follow-up', copy: 'Send quantities and receive a structured response from the team.' },
  { icon: Package, title: 'Cart or quote', copy: 'Buy simple stocked items or request pricing for bulk needs.' },
]

const categoryFallbackImages = [
  '/bewama/trade-strip.png',
  '/bewama/silicones-category.png',
  '/bewama/sealant-category.png',
  '/bewama/somagrit-sandpaper.jpg',
  '/bewama/pu-foam-cleaner.png',
]

const CATEGORY_IMAGE_BY_NAME: Record<string, string> = {
  adhesives: '/bewama/soma-bond-sb3200.png',
  abrasives: '/bewama/somagrit-sandpaper.jpg',
  silicones: '/bewama/silicones-category.png',
  sealant: '/bewama/sealant-category.png',
  sealants: '/bewama/sealant-category.png',
  'pu foam & cleaner': '/bewama/pu-foam-cleaner.png',
  chemicals: '/bewama/pu-foam-cleaner.png',
}

const productFallbackImages = [
  '/bewama/soma-bond-sb340.png',
  '/bewama/soma-bond-sb3200.png',
  '/bewama/pu-foam-cleaner.png',
  '/bewama/somagrit-sandpaper.jpg',
]

const workflowSteps = [
  {
    title: 'Tell us what you need',
    copy: 'Send the product, category, quantity, delivery area, and expected timeline.',
  },
  {
    title: 'We confirm the supply route',
    copy: 'The team checks availability, suitable alternatives, pack sizes, and delivery considerations.',
  },
  {
    title: 'You receive a clear quote',
    copy: 'The response can include pricing, quantities, lead time, and the next step for order confirmation.',
  },
]

const insights = [
  {
    icon: Package,
    title: 'Adhesives and sealants',
    copy: 'Contact adhesives, silicone sealants, PU foam, cleaners, and related application materials.',
  },
  {
    icon: FileText,
    title: 'Bulk project sourcing',
    copy: 'A quote path for contractors, workshops, resellers, and teams buying for a site or project.',
  },
  {
    icon: Truck,
    title: 'Delivery planning',
    copy: 'Share your delivery area early so availability and timing can be checked with the order.',
  },
]

async function fetchHomeData() {
  const supabase = createBuildClient()

  const [{ data: products }, { data: catRows }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug, category, brand, price, currency, pricing_type, stock, images')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('products')
      .select('category, images')
      .eq('is_active', true)
      .not('category', 'is', null),
  ])

  const categoryMap = new Map<string, { count: number; thumb: string | null }>()
  for (const row of catRows ?? []) {
    if (!row.category) continue
    const thumb = getFirstSafeImageSrc(row.images as string[] | null)
    const existing = categoryMap.get(row.category)
    if (existing) {
      existing.count++
      if (!existing.thumb && thumb) existing.thumb = thumb
    } else {
      categoryMap.set(row.category, { count: 1, thumb })
    }
  }

  const categories = [...categoryMap.entries()]
    .map(([name, meta]) => ({ name, ...meta }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    products: products ?? [],
    categories,
  }
}

function getCategoryImage(name: string, thumb: string | null, index: number) {
  return CATEGORY_IMAGE_BY_NAME[name.toLowerCase()] ?? thumb ?? categoryFallbackImages[index % categoryFallbackImages.length]
}

export default async function HomePage() {
  const { products, categories } = await fetchHomeData()
  const heroProducts = products.slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bewama',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254700000000',
      contactType: 'customer service',
      email: 'info@bewama.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[#03152d] text-white">
        <div className="mx-auto grid min-h-[660px] max-w-7xl grid-cols-1 items-center gap-11 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,590px)_minmax(320px,1fr)] lg:px-8">
          <div>
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-white/75">
              <span className="h-0.5 w-9 rounded-full bg-[#ff5f14]" />
              Construction materials supply
            </p>
            <h1 className="max-w-3xl text-[clamp(2.75rem,7vw,5.75rem)] font-black leading-[0.95] tracking-normal">
              Buy stocked materials or request a project quote.
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/80 sm:text-lg">
              Bewama supplies adhesives, sealants, silicones, abrasives, PU foam, cleaners, and
              related construction materials for contractors, workshops, resellers, and site teams.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-13 rounded-lg bg-[#ff5f14] px-6 text-sm font-black text-white shadow-lg shadow-[#ff5f14]/25 transition-all hover:-translate-y-0.5 hover:bg-[#e84f0a]"
              >
                <Link href="/request-quote">
                  <FileText className="mr-2 h-4 w-4" />
                  Request a Quote
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-13 rounded-lg border-[#061f3f]/20 bg-white px-6 text-sm font-black text-[#061f3f] transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <form
              action="/products"
              className="mt-8 grid w-full max-w-xl grid-cols-[1fr_auto] overflow-hidden rounded-lg border border-white/20 bg-white shadow-2xl shadow-black/25 max-sm:grid-cols-1"
            >
              <label className="sr-only" htmlFor="home-search">Search catalog</label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Try adhesive, foam cleaner, silicone sealant..."
                className="min-w-0 px-4 py-4 text-sm font-bold text-[#182333] outline-none placeholder:text-slate-400"
              />
              <button className="bg-[#ff5f14] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#e84f0a]">
                Search Products
              </button>
            </form>
          </div>

          <aside className="w-full max-w-[500px] justify-self-end max-lg:justify-self-start" aria-label="Featured catalog preview">
            <div className="rounded-lg border border-white/15 bg-white p-4 text-[#182333] shadow-2xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Live catalog</p>
                  <h2 className="mt-1 text-xl font-black leading-tight text-[#061f3f]">Popular materials</h2>
                </div>
                <Link href="/products" className="inline-flex items-center gap-1 text-xs font-black text-[#061f3f] hover:text-[#ff5f14]">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-3">
                {(heroProducts.length > 0 ? heroProducts : productFallbackImages.map((image, index) => ({
                  id: image,
                  name: ['Soma Bond Adhesive', 'PU Foam Cleaner', 'SomaGrit Sandpaper'][index] ?? 'Construction material',
                  slug: 'products',
                  category: ['Adhesives', 'PU Foam & Cleaner', 'Abrasives'][index] ?? 'Materials',
                  price: 0,
                  currency: 'KES',
                  pricing_type: 'quote',
                  stock: 0,
                  images: [image],
                }))).map((product, index) => {
                  const image = getFirstSafeImageSrc(
                    product.images as string[] | null,
                    productFallbackImages[index % productFallbackImages.length]
                  )

                  return (
                    <Link
                      key={product.id as string}
                      href={(product.slug as string) === 'products' ? '/products' : `/products/${product.slug as string}`}
                      className="grid grid-cols-[86px_1fr_auto] items-center gap-3 rounded-lg border border-[#edf1f5] bg-[#f8fafc] p-3 transition-colors hover:border-[#ff5f14]/40 hover:bg-[#fff8f4]"
                    >
                      <span className="relative block h-20 w-20 overflow-hidden rounded-lg bg-white">
                        <Image
                          src={image}
                          alt={product.name as string}
                          fill
                          className="object-contain p-2"
                          sizes="86px"
                          priority={index === 0}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-[#061f3f]">{product.name as string}</span>
                        <span className="mt-1 block truncate text-xs font-bold text-[#728196]">{product.category as string}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#ff5f14]" />
                    </Link>
                  )
                })}
              </div>

              <ul className="mt-4 grid gap-3 border-t border-[#edf1f5] pt-4">
                {proofItems.map((item) => (
                  <li key={item} className="grid grid-cols-[22px_1fr] gap-3 text-sm font-bold leading-6 text-[#4b5a6a]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#ff5f14]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { value: '39+', label: 'Active catalog items' },
                { value: 'RFQ', label: 'Bulk order support' },
                { value: 'KES', label: 'Local buying path' },
              ].map((metric) => (
                <div key={metric.label} className="min-h-24 rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <strong className="block text-2xl font-black leading-none text-white">{metric.value}</strong>
                  <span className="mt-2 block text-xs font-bold leading-snug text-white/70">{metric.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-[#d8e0ea] bg-white" aria-label="Store trust signals">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#edf1f5] px-4 sm:px-6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4 lg:px-8">
          {trustItems.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-4 py-5 md:px-4 lg:px-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fff1e8] text-[#ff5f14]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <strong className="block text-sm font-black leading-tight text-[#061f3f]">{title}</strong>
                <span className="mt-1 block text-xs font-semibold text-[#728196]">{copy}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead
            kicker="Shop by category"
            title="Start with the material type."
            copy="Browse the main product groups Bewama supplies, then open a category to compare available items, prices, and quote options."
            href="/products"
            linkText="View all categories"
          />

          {categories.length === 0 ? (
            <div className="rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] p-8 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-[#728196]" />
              <p className="font-black text-[#061f3f]">Categories will appear as products are added.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              {categories.map((category, index) => {
                const image = getCategoryImage(category.name, category.thumb, index)
                const isFeatured = index === 0
                return (
                  <Link
                    key={category.name}
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    className={[
                      'group relative min-h-[310px] overflow-hidden rounded-lg bg-[#061f3f] shadow-lg shadow-[#03152d]/10',
                      isFeatured ? 'lg:row-span-2 lg:min-h-[636px]' : '',
                    ].join(' ')}
                  >
                    <Image
                      src={image}
                      alt={`${category.name} category`}
                      fill
                      className="object-contain p-8 opacity-60 transition-transform duration-700 group-hover:scale-105"
                      sizes={isFeatured ? '(min-width: 1024px) 48vw, 100vw' : '(min-width: 1024px) 26vw, 100vw'}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#03152d] via-[#03152d]/72 to-[#03152d]/20" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
                          {category.count} product{category.count === 1 ? '' : 's'}
                        </span>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#ff5f14] transition-transform group-hover:translate-x-1">
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </div>
                      <h3 className="text-3xl font-black leading-tight sm:text-4xl">{category.name}</h3>
                      <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-white/75">
                        View available {category.name.toLowerCase()} products, check stock status, or request pricing for project quantities.
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f4f7fa] py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead
            kicker="Featured products"
            title="Stocked items are ready to move."
            copy="Use product cards for quick buying when an item is available, or request a quote when quantity, timing, or delivery details need confirmation."
            href="/products"
            linkText="Open product catalog"
          />

          {products.length === 0 ? (
            <div className="rounded-lg border border-[#d8e0ea] bg-white p-8 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-[#728196]" />
              <p className="font-black text-[#061f3f]">Featured products will appear when active products are added.</p>
              <Button asChild className="mt-5 rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
                <Link href="/request-quote">Request a Quote</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => {
                const image = getFirstSafeImageSrc(
                  product.images as string[] | null,
                  productFallbackImages[index % productFallbackImages.length]
                )
                const isQuote = product.pricing_type === 'quote'
                const inStock = Number(product.stock) > 0
                const symbol = CURRENCY_SYMBOLS[product.currency as string] ?? `${product.currency} `
                return (
                  <article
                    key={product.id as string}
                    className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-[#d8e0ea] bg-white shadow-[0_1px_0_rgba(3,21,45,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff5f14]/40 hover:shadow-2xl hover:shadow-[#03152d]/10"
                  >
                    <Link href={`/products/${product.slug}`} className="relative grid aspect-square place-items-center overflow-hidden bg-linear-to-br from-[#f9fbfd] to-[#edf2f7] p-6">
                      <span className="absolute left-3 top-3 z-10 rounded-full border border-[#d8e0ea] bg-white/95 px-2.5 py-1 text-[11px] font-black text-[#061f3f]">
                        {isQuote ? 'Bulk' : inStock ? 'Stocked' : 'Check stock'}
                      </span>
                      <Image
                        src={image}
                        alt={product.name as string}
                        fill
                        className="object-contain p-6 drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-4">
                      {product.category && (
                        <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#e84f0a]">
                          {product.category as string}
                        </p>
                      )}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="min-h-12 text-base font-black leading-snug text-[#061f3f] transition-colors hover:text-[#e84f0a]">
                          {product.name as string}
                        </h3>
                      </Link>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm font-bold text-[#4b5a6a]">
                        <span>{isQuote ? 'Price on request' : `${symbol}${Number(product.price).toLocaleString()}`}</span>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[#3b7a57]">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {isQuote ? 'RFQ' : inStock ? 'In stock' : 'Ask'}
                        </span>
                      </div>
                      <div className="mt-auto grid grid-cols-[1fr_44px] gap-2 pt-4">
                        {isQuote || !inStock ? (
                          <Button asChild className="h-10 rounded-lg bg-[#ff5f14] text-xs font-black text-white hover:bg-[#e84f0a]">
                            <Link href={`/request-quote?product=${encodeURIComponent(product.name as string)}`}>Request Quote</Link>
                          </Button>
                        ) : (
                          <AddToCartButton
                            product={{
                              id: product.id as string,
                              name: product.name as string,
                              slug: product.slug as string,
                              price: product.price as number,
                              currency: product.currency as string,
                              image,
                            }}
                            size="sm"
                            className="h-10 rounded-lg text-xs font-black"
                          />
                        )}
                        <Button
                          asChild
                          variant="outline"
                          className="h-10 rounded-lg border-[#d8e0ea] px-0 text-[#061f3f] hover:border-[#ff5f14] hover:bg-[#fff8f4]"
                        >
                          <Link href={`/request-quote?product=${encodeURIComponent(product.name as string)}`} aria-label={`Add ${product.name as string} to quote`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-18 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] p-5">
            <div className="grid grid-cols-2 gap-3">
              {productFallbackImages.map((image, index) => (
                <div key={image} className="relative aspect-square rounded-lg border border-[#d8e0ea] bg-white p-4">
                  <Image
                    src={image}
                    alt={['Soma Bond adhesive', 'Soma Bond contact adhesive', 'PU foam cleaner', 'SomaGrit sandpaper'][index] ?? 'Bewama product'}
                    fill
                    className="object-contain p-4"
                    sizes="(min-width: 1024px) 220px, 45vw"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-[48px_1fr] items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#fff1e8] text-[#ff5f14]">
                <Shield className="h-6 w-6" />
              </span>
              <div>
                <strong className="block text-sm font-black text-[#061f3f]">Clear products, clear next steps</strong>
                <span className="text-sm font-bold text-[#4b5a6a]">Open the catalog for pack sizes, product categories, price labels, and quote options.</span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#e84f0a]">Quote process</p>
            <h2 className="text-4xl font-black leading-[1.02] text-[#061f3f] sm:text-5xl">
              Buying in bulk should feel straightforward.
            </h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-[#4b5a6a]">
              When the order depends on quantity, delivery area, or product alternatives, send a quote
              request instead of guessing in the cart.
            </p>

            <div className="mt-8 grid gap-3">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[54px_1fr] gap-4 rounded-lg border border-[#d8e0ea] bg-white p-5 shadow-[0_1px_0_rgba(3,21,45,0.04)]">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#061f3f] text-sm font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-[#061f3f]">{step.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-[#4b5a6a]">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#03152d] text-white">
        <div className="mx-auto grid min-h-[440px] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,600px)_minmax(280px,1fr)] lg:px-8">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Bulk and project orders</p>
            <h2 className="text-4xl font-black leading-[1.02] text-white sm:text-5xl">
              Need many items or a site delivery plan?
            </h2>
            <p className="mt-5 max-w-xl text-base font-medium leading-8 text-white/75">
              Send your list, quantities, preferred brands, delivery location, and timeline. Bewama
              will review the request and respond with the practical next step.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-13 rounded-lg bg-[#ff5f14] px-6 font-black text-white hover:bg-[#e84f0a]">
                <Link href="/request-quote">
                  Request Bulk Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-13 rounded-lg border-[#061f3f]/20 bg-white px-6 font-black text-[#061f3f] hover:bg-white">
                <Link href="/products">Keep Browsing</Link>
              </Button>
            </div>
          </div>

          <aside className="w-full max-w-[420px] justify-self-end rounded-lg bg-white/95 p-5 text-[#182333] shadow-2xl max-lg:justify-self-start">
            <h3 className="mb-4 text-lg font-black text-[#061f3f]">Quick quote starter</h3>
            <form action="/request-quote" className="grid gap-3">
              <label className="sr-only" htmlFor="quote-product">Product or category</label>
              <input id="quote-product" name="product" placeholder="Product or category" className="h-11 rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] px-3 text-sm font-bold outline-none focus:border-[#ff5f14] focus:bg-white focus:ring-4 focus:ring-[#ff5f14]/10" />
              <label className="sr-only" htmlFor="quote-quantity">Quantity and unit</label>
              <input id="quote-quantity" name="quantity" placeholder="Quantity and unit" className="h-11 rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] px-3 text-sm font-bold outline-none focus:border-[#ff5f14] focus:bg-white focus:ring-4 focus:ring-[#ff5f14]/10" />
              <label className="sr-only" htmlFor="quote-urgency">Delivery timeline</label>
              <select id="quote-urgency" name="urgency" className="h-11 rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] px-3 text-sm font-bold outline-none focus:border-[#ff5f14] focus:bg-white focus:ring-4 focus:ring-[#ff5f14]/10">
                <option>Delivery timeline</option>
                <option>This week</option>
                <option>Within 2 weeks</option>
                <option>Project planning</option>
              </select>
              <Button className="mt-1 h-11 rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
                Continue to RFQ
              </Button>
            </form>
          </aside>
        </div>
      </section>

      <section className="bg-[#f4f7fa] py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#e84f0a]">What Bewama supplies</p>
            <h2 className="text-4xl font-black leading-[1.02] text-[#061f3f] sm:text-5xl">
              Materials for trade, site, and workshop needs.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {insights.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-lg border border-[#d8e0ea] bg-white p-6 shadow-[0_1px_0_rgba(3,21,45,0.04)]">
                <Icon className="mb-6 h-7 w-7 text-[#ff5f14]" />
                <h3 className="text-xl font-black leading-tight text-[#061f3f]">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-7 text-[#4b5a6a]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function SectionHead({
  kicker,
  title,
  copy,
  href,
  linkText,
}: {
  kicker: string
  title: string
  copy: string
  href: string
  linkText: string
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#e84f0a]">{kicker}</p>
        <h2 className="max-w-2xl text-4xl font-black leading-[1.02] text-[#061f3f] sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#4b5a6a]">{copy}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-black text-[#061f3f] transition-colors hover:text-[#e84f0a]"
      >
        {linkText}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
