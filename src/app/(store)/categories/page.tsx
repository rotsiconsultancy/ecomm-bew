import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { createBuildClient } from '@/lib/supabase/server'
import { ArrowRight, Layers } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Categories | Bewama',
  description: 'Browse our industrial product categories — silicones, timber, tools, chemicals and more.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'}/categories` },
}

export const revalidate = 1800

const GRADIENTS = [
  'from-[#003366] to-[#004a8f]',
  'from-[#ec5b13] to-[#c74400]',
  'from-[#1a1a2e] to-[#003366]',
  'from-[#5c3d11] to-[#ec5b13]',
  'from-[#0f4c75] to-[#003366]',
  'from-[#003366] to-[#1a1a2e]',
]

export default async function CategoriesPage() {
  const supabase = createBuildClient()

  const { data: rows } = await supabase
    .from('products')
    .select('category, images')
    .eq('is_active', true)
    .not('category', 'is', null)

  // Build categories: name → { count, thumb }
  const catMap = new Map<string, { count: number; thumb: string | null }>()
  for (const row of rows ?? []) {
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

  const categories = [...catMap.entries()]
    .map(([name, meta]) => ({ name, ...meta }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-px bg-[#ec5b13]" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec5b13]">
            Browse by type
          </span>
        </div>
        <h1 className="text-4xl font-black text-[#003366] tracking-tight">
          Product Categories
        </h1>
        <p className="text-gray-500 mt-2">
          {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} available
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20">
          <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No categories yet. Products will appear here once added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ name, count, thumb }, i) => (
            <Link
              key={name}
              href={`/products?category=${encodeURIComponent(name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-4/3 block"
            >
              {/* Background */}
              {thumb ? (
                <Image
                  src={thumb}
                  alt={name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className={`absolute inset-0 bg-linear-to-br ${GRADIENTS[i % GRADIENTS.length]}`} />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-black text-white text-2xl leading-tight">{name}</h2>
                    <p className="text-white/60 text-sm mt-1">
                      {count} product{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#ec5b13] group-hover:border-[#ec5b13] transition-all shrink-0">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}