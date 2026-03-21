import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { createBuildClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/add-to-cart-button'
import {
  ArrowRight, Package, FileText, Shield,
  Truck, Clock, Globe2, ChevronRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bewama — Industrial Materials & Brokerage',
  description:
    'Quality chemicals, timber, silicones, and industrial materials. Fast delivery across East Africa. Request a custom quote today.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'}/` },
}

export const revalidate = 1800

// ─── Category gradient palettes ───────────────────────────────────────────────

const CAT_GRADIENTS = [
  'from-[#003366] to-[#004080]',
  'from-[#ec5b13] to-[#d14d0d]',
  'from-[#1a1a2e] to-[#003366]',
  'from-[#5c3d11] to-[#ec5b13]',
  'from-[#003366] to-[#1a1a2e]',
  'from-[#0f4c75] to-[#003366]',
]

// ─── Data Fetcher ─────────────────────────────────────────────────────────────

async function fetchHomeData() {
  const supabase = createBuildClient()

  const [{ data: products }, { data: catRows }, { count: totalCount }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug, category, brand, price, currency, pricing_type, stock, images')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),

    supabase
      .from('products')
      .select('category, images')
      .eq('is_active', true)
      .not('category', 'is', null),

    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  // Build category map: name → { count, thumb }
  const catMap = new Map<string, { count: number; thumb: string | null }>()
  for (const row of catRows ?? []) {
    if (!row.category) continue
    const existing = catMap.get(row.category)
    const thumb = (row.images as string[] | null)?.[0] ?? null
    if (existing) {
      existing.count++
      if (!existing.thumb && thumb) existing.thumb = thumb
    } else {
      catMap.set(row.category, { count: 1, thumb })
    }
  }

  const categories = [...catMap.entries()].map(([name, meta]) => ({
    name, ...meta,
  }))

  return {
    products:   products ?? [],
    categories,
    totalCount: totalCount ?? 0,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { products, categories, totalCount } = await fetchHomeData()

  const CURRENCY_SYMBOLS: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#003366] text-white overflow-hidden">

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Orange accent rule */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ec5b13]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* ── Left: Copy ─────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-8">
              {/* Label */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#ec5b13]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec5b13]">
                  Industrial Brokerage
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight">
                Sourcing that{' '}
                <br />
                <span className="relative inline-block">
                  <span className="text-[#ec5b13]">works</span>
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#ec5b13]/30 rounded" />
                </span>{' '}
                for your{' '}
                <br />
                business.
              </h1>

              <p className="text-lg text-white/70 max-w-xl leading-relaxed">
                Quality chemicals, timber, silicones, and industrial materials — sourced reliably
                and delivered across East Africa. Wholesale pricing available.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  asChild
                  className="h-12 px-8 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-bold text-sm rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ec5b13]/30"
                >
                  <Link href="/products" className="flex items-center gap-2">
                    Explore Catalog
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-8 border-white/30 hover:border-white text-white hover:bg-white/10 font-bold text-sm rounded-lg bg-transparent transition-all"
                >
                  <Link href="/request-quote">Request a Quote</Link>
                </Button>
              </div>
            </div>

            {/* ── Right: Stats grid ───────────────────────────────── */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[
                { value: totalCount > 0 ? `${totalCount}+` : '50+', label: 'Products in stock', icon: Package },
                { value: '24h',  label: 'Quote turnaround',         icon: Clock },
                { value: 'EAT',  label: 'Nairobi-based operations', icon: Globe2 },
                { value: 'B2B',  label: 'Wholesale accounts',       icon: Shield },
              ].map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="border border-white/15 rounded-xl p-5 flex flex-col gap-3 hover:border-white/30 hover:bg-white/5 transition-all"
                >
                  <Icon className="w-5 h-5 text-[#ec5b13]" />
                  <div>
                    <p className="text-3xl font-black tracking-tight">{value}</p>
                    <p className="text-xs text-white/50 mt-1 leading-snug">{label}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: Truck,  label: 'Nairobi delivery',   sub: 'Same or next-day dispatch' },
              { icon: Shield, label: 'Quality guaranteed', sub: 'All products verified' },
              { icon: Clock,  label: 'Quote in 24 hours',  sub: 'Fast & professional response' },
              { icon: Globe2, label: 'Bulk supply',        sub: 'Wholesale & retail' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-4 py-5 px-6">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#ec5b13]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#003366]">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec5b13] mb-2">
                  Browse by type
                </p>
                <h2 className="text-3xl font-black text-[#003366] tracking-tight">
                  Industrial Categories
                </h2>
              </div>
              <Link
                href="/categories"
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#003366] hover:text-[#ec5b13] transition-colors"
              >
                All categories <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className={`grid gap-5 ${
              categories.length === 1 ? 'grid-cols-1' :
              categories.length === 2 ? 'grid-cols-2' :
              categories.length <= 4 ? 'grid-cols-2 md:grid-cols-4' :
              'grid-cols-2 md:grid-cols-3'
            }`}>
              {categories.slice(0, 6).map(({ name, count, thumb }, i) => (
                <Link
                  key={name}
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="group relative overflow-hidden rounded-2xl aspect-4/3 block"
                >
                  {/* Background: real image or gradient */}
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-linear-to-br ${CAT_GRADIENTS[i % CAT_GRADIENTS.length]}`} />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Label */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="font-black text-white text-xl leading-tight">{name}</p>
                      <p className="text-white/60 text-sm mt-1">
                        {count} product{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#ec5b13] group-hover:border-[#ec5b13] transition-all">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec5b13] mb-2">
                New arrivals
              </p>
              <h2 className="text-3xl font-black text-[#003366] tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#003366] hover:text-[#ec5b13] transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <Package className="w-16 h-16 mx-auto mb-4" />
              <p className="font-medium text-gray-400">Products coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const thumb    = (product.images as string[] | null)?.[0] ?? null
                const symbol   = CURRENCY_SYMBOLS[product.currency as string] ?? `${product.currency} `
                const isQuote  = product.pricing_type === 'quote'
                const inStock  = product.stock > 0

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col rounded-2xl border border-gray-100 bg-white hover:border-[#003366]/20 hover:shadow-xl hover:shadow-[#003366]/5 transition-all duration-300"
                  >
                    {/* Image */}
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="relative aspect-square rounded-t-2xl overflow-hidden bg-gray-50">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={product.name as string}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-200" />
                          </div>
                        )}
                        {!inStock && !isQuote && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Out of stock</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      {product.category && (
                        <Badge className="self-start mb-2 text-xs bg-orange-50 text-[#ec5b13] border-none font-semibold">
                          {product.category as string}
                        </Badge>
                      )}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-[#003366] text-sm line-clamp-2 leading-snug hover:text-[#ec5b13] transition-colors">
                          {product.name as string}
                        </h3>
                      </Link>
                      {product.brand && (
                        <p className="text-xs text-gray-400 mt-1">{product.brand as string}</p>
                      )}

                      <div className="mt-auto pt-4 space-y-3">
                        {/* Price */}
                        {isQuote ? (
                          <span className="text-sm font-bold text-[#ec5b13]">Price on Request</span>
                        ) : (
                          <span className="text-xl font-black text-[#003366]">
                            {symbol}{(product.price as number).toLocaleString()}
                          </span>
                        )}

                        {/* CTAs */}
                        <div className="flex items-center gap-2">
                          {isQuote ? (
                            <Link href={`/request-quote?product=${encodeURIComponent(product.name as string)}`} className="flex-1">
                              <Button size="sm" className="w-full h-9 bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-xs font-bold">
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                Request Quote
                              </Button>
                            </Link>
                          ) : (
                            <>
                              <AddToCartButton
                                product={{
                                  id: product.id as string,
                                  name: product.name as string,
                                  slug: product.slug as string,
                                  price: product.price as number,
                                  currency: product.currency as string,
                                  image: thumb,
                                }}
                                size="sm"
                                className="flex-1 h-9 text-xs"
                              />
                              <Link href={`/request-quote?product=${encodeURIComponent(product.name as string)}`}>
                                <Button size="sm" variant="outline" className="h-9 border-[#003366]/20 text-[#003366] hover:border-[#003366]">
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

          {/* Mobile "View All" */}
          <div className="sm:hidden mt-8 text-center">
            <Link href="/products">
              <Button variant="outline" className="border-[#003366] text-[#003366] font-bold">
                View All Products <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quote CTA banner ──────────────────────────────────────────────── */}
      <section className="relative bg-[#003366] overflow-hidden">
        {/* Decorative orange shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#ec5b13] clip-right hidden lg:block"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 hidden lg:block"
          style={{
            clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
            backgroundColor: '#ec5b13',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec5b13] mb-4">
              Custom sourcing
            </p>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5">
              Need bulk pricing or a custom solution?
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Tell us what you need. Our team will put together a competitive quote within 24 hours.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="h-12 px-8 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-bold rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ec5b13]/40"
              >
                <Link href="/request-quote" className="flex items-center gap-2">
                  Request a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-8 border-white/30 hover:border-white text-white hover:bg-white/10 font-bold rounded-lg bg-transparent"
              >
                <Link href="/products">Browse Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
