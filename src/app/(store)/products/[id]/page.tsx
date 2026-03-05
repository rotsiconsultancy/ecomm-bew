// NOTE: Folder is named [id] but the param value is a product slug.
// We destructure as `{ id: slug }` to clarify intent.
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata, ResolvingMetadata } from 'next'
import { ShieldCheck, Truck, RefreshCw, FileText, ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient, createBuildClient } from '@/lib/supabase/server'
import { generateProductSchema } from '@/lib/seo/product-schema'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

export const revalidate = 1800

type Props = {
  params: Promise<{ id: string }> // 'id' folder param contains the slug value
}

export async function generateStaticParams() {
  const supabase = createBuildClient()
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true)
  // Return as { id: slug } because the folder segment is named [id]
  return (data ?? []).map((p) => ({ id: p.slug }))
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id: slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, seo_title, seo_description, seo_keywords, brand, category')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!product) return { title: 'Not Found' }

  const title       = product.seo_title ?? product.name
  const description = product.seo_description ?? `${product.name} — available at Bewama`
  const image       = product.images?.[0]

  return {
    title: `${title} | Bewama`,
    description,
    keywords: product.seo_keywords ?? undefined,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id: slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!product) notFound()

  // Related products (same category, excluding this one)
  const { data: related } = product.category
    ? await supabase
        .from('products')
        .select('id, name, slug, images, price, currency, category')
        .eq('is_active', true)
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(4)
    : { data: [] }

  // Render TipTap description to HTML
  let htmlContent = ''
  if (product.description) {
    try {
      const json = JSON.parse(product.description)
      htmlContent = generateHTML(json, [StarterKit, Underline, TiptapImage, TiptapLink])
    } catch {
      htmlContent = ''
    }
  }

  const jsonLd = generateProductSchema(product)
  const inStock = product.stock > 0
  const CURRENCY_SYMBOLS: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }
  const symbol = CURRENCY_SYMBOLS[product.currency] ?? product.currency + ' '
  const images: string[] = product.images ?? []

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8 gap-2">
          <Link href="/" className="hover:text-[#ec5b13] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#ec5b13] transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-[#ec5b13] transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#003366] font-semibold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* ── Image Gallery ── */}
          <ImageGallery images={images} name={product.name} />

          {/* ── Product Info ── */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge className="bg-orange-50 text-orange-700 border-none font-semibold mb-3">
                  {product.category}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#003366] leading-tight">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-gray-400 mt-1 text-sm">by {product.brand}</p>
              )}
            </div>

            {/* Price & stock */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-[#003366]">
                  {symbol}{product.price.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Excluding taxes &amp; shipping</p>
              <div className="mt-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-sm font-semibold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                  {inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Link
                href={`/request-quote?product=${encodeURIComponent(product.name)}`}
                className="block"
              >
                <Button className="w-full h-12 bg-[#003366] hover:bg-[#002244] text-white font-bold text-base transition-all shadow-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Request a Quote
                </Button>
              </Link>
              <Link href="/products" className="block">
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white font-bold transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse More Products
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center space-y-2">
                <ShieldCheck className="mx-auto h-7 w-7 text-[#ec5b13]" />
                <p className="text-xs font-bold text-[#003366]">Quality Assured</p>
              </div>
              <div className="text-center space-y-2">
                <Truck className="mx-auto h-7 w-7 text-[#ec5b13]" />
                <p className="text-xs font-bold text-[#003366]">Fast Delivery</p>
              </div>
              <div className="text-center space-y-2">
                <RefreshCw className="mx-auto h-7 w-7 text-[#ec5b13]" />
                <p className="text-xs font-bold text-[#003366]">Reliable Supply</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        {htmlContent && (
          <div className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold text-[#003366] mb-6">Product Description</h2>
            <div
              className="prose prose-slate prose-lg max-w-none prose-headings:text-[#003366] prose-a:text-[#ec5b13] prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        )}

        {/* ── Related Products ── */}
        {related && related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-[#003366] mb-8">
              More in {product.category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((rel) => {
                const sym = CURRENCY_SYMBOLS[rel.currency] ?? rel.currency + ' '
                const thumb = rel.images?.[0]
                return (
                  <Link key={rel.id} href={`/products/${rel.slug}`} className="group">
                    <div className="bg-gray-50 rounded-xl aspect-square flex items-center justify-center overflow-hidden mb-3 border border-gray-100">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={rel.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-200" />
                      )}
                    </div>
                    <p className="font-bold text-[#003366] text-sm line-clamp-2 group-hover:text-[#ec5b13] transition-colors">
                      {rel.name}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                      {sym}{rel.price.toLocaleString()}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const primary = images[0]
  const thumbs  = images.slice(1, 4)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden aspect-square flex items-center justify-center p-6">
        {primary ? (
          <Image
            src={primary}
            alt={name}
            width={500}
            height={500}
            className="max-w-full max-h-full object-contain"
            priority
          />
        ) : (
          <Package className="w-24 h-24 text-gray-200" />
        )}
      </div>
      {thumbs.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border-2 border-[#ec5b13] overflow-hidden aspect-square flex items-center justify-center p-2">
            {primary && (
              <Image src={primary} alt={`${name} 1`} width={80} height={80} className="object-contain" />
            )}
          </div>
          {thumbs.map((img, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden aspect-square flex items-center justify-center p-2"
            >
              <Image
                src={img}
                alt={`${name} ${i + 2}`}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
