'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Package, Layers, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProductResult {
  id: string
  name: string
  slug: string
  category: string | null
  price: number
  currency: string
  pricing_type: string
  images: string[] | null
}

interface CategoryResult {
  name: string
  count: number
}

const CURRENCY_SYMBOLS: Record<string, string> = { KES: 'KES ', EUR: '€', USD: '$' }

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductResult[]>([])
  const [categories, setCategories] = useState<CategoryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Total results for keyboard nav
  const totalResults = categories.length + products.length

  // Cmd+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Focus input when open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setProducts([])
      setCategories([])
      setActiveIndex(0)
    }
  }, [open])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Search with debounce
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([])
      setCategories([])
      return
    }

    setLoading(true)
    const supabase = createClient()

    const [{ data: prods }, { data: catRows }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, category, price, currency, pricing_type, images')
        .eq('is_active', true)
        .ilike('name', `%${q}%`)
        .limit(6),
      supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null),
    ])

    // Build category matches
    const catMap = new Map<string, number>()
    for (const row of catRows ?? []) {
      if (!row.category) continue
      catMap.set(row.category, (catMap.get(row.category) ?? 0) + 1)
    }
    const matchedCats = [...catMap.entries()]
      .filter(([name]) => name.toLowerCase().includes(q.toLowerCase()))
      .map(([name, count]) => ({ name, count }))
      .slice(0, 3)

    setProducts(prods ?? [])
    setCategories(matchedCats)
    setActiveIndex(0)
    setLoading(false)
  }, [])

  function onInputChange(value: string) {
    setQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 250)
  }

  function navigate(url: string) {
    setOpen(false)
    router.push(url)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % Math.max(totalResults, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex < categories.length) {
        navigate(`/products?category=${encodeURIComponent(categories[activeIndex].name)}`)
      } else {
        const productIdx = activeIndex - categories.length
        if (products[productIdx]) {
          navigate(`/products/${products[productIdx].slug}`)
        }
      }
    }
  }

  if (!open) {
    return (
      <>
        {/* Desktop search trigger */}
        <button
          onClick={() => setOpen(true)}
          className="hidden md:flex flex-1 max-w-2xl items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors cursor-text"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Search products, categories...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono bg-gray-100 text-gray-400 rounded border border-gray-200">
            Ctrl K
          </kbd>
        </button>
        {/* Mobile search icon */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-2 text-gray-500 hover:text-[#003366] transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </>
    )
  }

  const hasResults = categories.length > 0 || products.length > 0
  const showEmpty = query.length >= 2 && !loading && !hasResults

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative max-w-xl mx-auto mt-[10vh] mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search products, categories..."
              className="flex-1 py-4 text-base outline-none placeholder:text-gray-400"
            />
            {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="px-3 py-2">
                <p className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Categories
                </p>
                {categories.map((cat, i) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeIndex === i ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-[#ec5b13]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#003366] truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400">{cat.count} product{cat.count !== 1 ? 's' : ''}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            {products.length > 0 && (
              <div className="px-3 py-2">
                <p className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Products
                </p>
                {products.map((product, i) => {
                  const globalIdx = categories.length + i
                  const thumb = product.images?.[0] ?? null
                  const sym = CURRENCY_SYMBOLS[product.currency] ?? `${product.currency} `

                  return (
                    <button
                      key={product.id}
                      onClick={() => navigate(`/products/${product.slug}`)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeIndex === globalIdx ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {thumb ? (
                          <Image src={thumb} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#003366] truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          {product.category && <span>{product.category} · </span>}
                          {product.pricing_type === 'quote'
                            ? <span className="text-[#ec5b13]">Quote</span>
                            : <span>{sym}{product.price.toLocaleString()}</span>
                          }
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="px-5 py-10 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
                <button
                  onClick={() => navigate('/products')}
                  className="mt-3 text-sm font-semibold text-[#ec5b13] hover:underline"
                >
                  Browse all products
                </button>
              </div>
            )}

            {/* Idle state */}
            {query.length < 2 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-400">Type at least 2 characters to search</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200">↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200">esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
