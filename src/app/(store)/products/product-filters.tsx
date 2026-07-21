'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type ProductFiltersProps = {
  brandGroups: Array<{
    name: string
    value: string
    count: number
    categories: Array<{ name: string; count: number }>
  }>
  category?: string
  brand?: string
  query?: string
  hasFilters: boolean
  totalCatalogCount: number
  display?: 'mobile' | 'desktop' | 'both'
}

export function ProductFilters(props: ProductFiltersProps) {
  const activeFilterCount = Number(Boolean(props.category)) + Number(Boolean(props.brand))

  return (
    <>
      <div className={props.display === 'desktop' ? 'hidden' : 'lg:hidden'}>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-lg border-[#061f3f]/20 bg-white px-4 font-black text-[#061f3f] shadow-sm hover:border-[#ff5f14] hover:bg-[#fff8f4]"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#ff5f14]" />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#061f3f] px-1.5 text-[11px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] gap-0 overflow-hidden rounded-t-2xl border-[#d8e0ea] bg-white p-0"
          >
            <SheetHeader className="border-b border-[#edf1f5] px-5 py-5 pr-12 text-left">
              <SheetTitle className="flex items-center gap-2 text-base font-black uppercase tracking-widest text-[#061f3f]">
                <SlidersHorizontal className="h-4 w-4 text-[#ff5f14]" />
                Filter catalog
              </SheetTitle>
              <SheetDescription className="font-semibold text-[#728196]">
                Open a brand, then choose one of its categories.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto overscroll-contain px-5 py-5">
              <FilterContent {...props} closeOnSelect />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className={props.display === 'mobile' ? 'hidden' : 'hidden space-y-4 lg:sticky lg:top-36 lg:block lg:self-start'}>
        <div className="rounded-lg border border-[#d8e0ea] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#ff5f14]" />
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#061f3f]">Filter catalog</h2>
          </div>
          <FilterContent {...props} />
        </div>

        <div className="rounded-lg border border-[#ff5f14]/20 bg-[#fff8f4] p-5">
          <h3 className="font-black text-[#061f3f]">Buying in bulk?</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#4b5a6a]">
            Send quantities, delivery point, and timing for a structured quote response.
          </p>
          <Button asChild className="mt-4 w-full rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
            <Link href="/request-quote">Request Bulk Quote</Link>
          </Button>
        </div>
      </aside>
    </>
  )
}

function FilterContent({
  brandGroups,
  category,
  brand,
  query,
  hasFilters,
  totalCatalogCount,
  closeOnSelect = false,
}: ProductFiltersProps & { closeOnSelect?: boolean }) {
  const link = (content: ReactNode) => closeOnSelect ? <SheetClose asChild>{content}</SheetClose> : content
  const [openBrands, setOpenBrands] = useState<string[]>(brand ? [brand.toLowerCase()] : [])

  function buildHref(next: { brand?: string; category?: string }) {
    const params = new URLSearchParams()
    if (next.brand) params.set('brand', next.brand)
    if (next.category) params.set('category', next.category)
    if (query) params.set('q', query)
    const value = params.toString()
    return `/products${value ? `?${value}` : ''}`
  }

  function toggleBrand(value: string) {
    const key = value.toLowerCase()
    setOpenBrands((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])
  }

  return (
    <div className="space-y-6">
      {brandGroups.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#728196]">Brands &amp; categories</h3>
          <div className="grid gap-2.5">
            {link(<FilterLink href={buildHref({})} active={!category && !brand} label="All products" count={totalCatalogCount} />)}
            {brandGroups.map((group) => {
              const groupKey = group.value.toLowerCase()
              const selectedBrand = brand?.toLowerCase() === groupKey
              const expanded = openBrands.includes(groupKey) || selectedBrand

              return (
                <div key={group.value} className="overflow-hidden rounded-lg border border-[#e1e7ed] bg-white">
                  <div className="grid grid-cols-[minmax(0,1fr)_44px] items-stretch">
                    {link(
                      <Link
                        href={buildHref({ brand: group.value })}
                        className={`flex min-h-11 min-w-0 items-center justify-between gap-2 px-3 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff5f14] ${
                          selectedBrand && !category ? 'bg-[#061f3f] text-white' : 'text-[#334155] hover:bg-[#f4f7fa]'
                        }`}
                      >
                        <span className="truncate">{group.name}</span>
                        <span className={selectedBrand && !category ? 'text-white/70' : 'text-[#728196]'}>{group.count}</span>
                      </Link>,
                    )}
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${group.name} categories`}
                      onClick={() => toggleBrand(group.value)}
                      className={`grid min-h-11 place-items-center border-l border-[#e1e7ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff5f14] ${
                        selectedBrand && !category ? 'bg-[#061f3f] text-white hover:bg-[#0a2d58]' : 'text-[#64748b] hover:bg-[#f4f7fa] hover:text-[#061f3f]'
                      }`}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {expanded && (
                    <div className="grid gap-1 border-t border-[#e1e7ed] bg-[#f8fafc] p-2">
                      {group.categories.length > 0 ? group.categories.map((item) => {
                        const selected = selectedBrand && category?.toLowerCase() === item.name.toLowerCase()
                        return link(
                          <Link
                            key={`${group.value}-${item.name}`}
                            href={buildHref({ brand: group.value, category: item.name })}
                            aria-current={selected ? 'page' : undefined}
                            className={`flex min-h-10 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14] ${
                              selected ? 'bg-[#fff0e8] text-[#a83a08]' : 'text-[#526274] hover:bg-white hover:text-[#061f3f]'
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Check className={`h-3.5 w-3.5 shrink-0 ${selected ? 'opacity-100' : 'opacity-0'}`} />
                              <span className="truncate">{item.name}</span>
                            </span>
                            <span className="text-xs tabular-nums text-[#728196]">{item.count}</span>
                          </Link>,
                        )
                      }) : (
                        <p className="px-3 py-2 text-xs font-semibold text-[#728196]">No categories assigned.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasFilters && link(
        <Button asChild variant="outline" className="w-full rounded-lg border-[#061f3f]/25 font-black text-[#061f3f]">
          <Link href="/products">Clear filters</Link>
        </Button>
      )}
    </div>
  )
}

function FilterLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-black transition-colors',
        active ? 'bg-[#061f3f] text-white' : 'text-[#4b5a6a] hover:bg-[#f4f7fa] hover:text-[#061f3f]',
      ].join(' ')}
    >
      <span>{label}</span>
      <span className={active ? 'text-white/70' : 'text-[#728196]'}>{count}</span>
    </Link>
  )
}
