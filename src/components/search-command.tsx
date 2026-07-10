'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Package, Layers, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getFirstSafeImageSrc } from '@/lib/images'

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
        .or('product_status.is.null,product_status.eq.active')
        .ilike('name', `%${q}%`)
        .limit(6),
      supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .or('product_status.is.null,product_status.eq.active')
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
          className="hidden min-h-12 flex-1 cursor-text items-center gap-3 rounded-lg border border-[#d8e0ea] bg-[#f4f7fa] px-4 text-sm font-bold text-[#728196] transition-colors hover:border-[#ff5f14]/50 hover:bg-white md:flex"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Search adhesives, silicones, abrasives...</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-[#d8e0ea] bg-white px-1.5 py-0.5 font-mono text-xs text-[#728196] lg:inline-flex">
            Ctrl K
          </kbd>
        </button>
        {/* Mobile search icon */}
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[#061f3f] transition-colors hover:text-[#ff5f14] md:hidden"
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
    <div className="fixed inset-0 z-100">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#03152d]/55 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative mx-4 mt-[10vh] max-w-xl sm:mx-auto">
        <div className="overflow-hidden rounded-lg border border-[#d8e0ea] bg-white shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-[#edf1f5] px-5">
            <Search className="w-5 h-5 text-[#728196] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search products, categories..."
              className="flex-1 py-4 text-base font-bold outline-none placeholder:text-[#728196]"
            />
            {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-[#728196] transition-colors hover:text-[#061f3f]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="px-3 py-2">
                <p className="px-2 py-1.5 text-xs font-black uppercase tracking-widest text-[#728196]">
                  Categories
                </p>
                {categories.map((cat, i) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeIndex === i ? 'bg-[#f4f7fa]' : 'hover:bg-[#f4f7fa]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#fff1e8] flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-[#ff5f14]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[#061f3f] truncate">{cat.name}</p>
                      <p className="text-xs text-[#728196]">{cat.count} product{cat.count !== 1 ? 's' : ''}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            {products.length > 0 && (
              <div className="px-3 py-2">
                <p className="px-2 py-1.5 text-xs font-black text-[#728196] uppercase tracking-widest">
                  Products
                </p>
                {products.map((product, i) => {
                  const globalIdx = categories.length + i
                  const thumb = getFirstSafeImageSrc(product.images)
                  const sym = CURRENCY_SYMBOLS[product.currency] ?? `${product.currency} `

                  return (
                    <button
                      key={product.id}
                      onClick={() => navigate(`/products/${product.slug}`)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeIndex === globalIdx ? 'bg-[#f4f7fa]' : 'hover:bg-[#f4f7fa]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#f4f7fa] border border-[#edf1f5] flex items-center justify-center shrink-0 overflow-hidden">
                        {thumb ? (
                          <Image src={thumb} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <Package className="w-4 h-4 text-[#728196]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#061f3f] truncate">{product.name}</p>
                        <p className="text-xs text-[#728196]">
                          {product.category && <span>{product.category} · </span>}
                          {product.pricing_type === 'quote'
                            ? <span className="text-[#ff5f14]">Quote</span>
                            : <span>{sym}{product.price.toLocaleString()}</span>
                          }
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#728196] shrink-0" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="px-5 py-10 text-center">
                <Package className="w-10 h-10 text-[#728196] mx-auto mb-3" />
                <p className="text-sm text-[#728196]">No results for &ldquo;{query}&rdquo;</p>
                <button
                  onClick={() => navigate('/products')}
                  className="mt-3 text-sm font-black text-[#ff5f14] hover:underline"
                >
                  Browse all products
                </button>
              </div>
            )}

            {/* Idle state */}
            {query.length < 2 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[#728196]">Type at least 2 characters to search</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-[#edf1f5] flex items-center justify-between text-xs text-[#728196]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-[#f4f7fa] rounded text-[10px] border border-[#d8e0ea]">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-[#f4f7fa] rounded text-[10px] border border-[#d8e0ea]">↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-[#f4f7fa] rounded text-[10px] border border-[#d8e0ea]">esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
