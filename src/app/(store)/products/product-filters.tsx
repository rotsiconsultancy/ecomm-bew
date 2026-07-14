'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { SlidersHorizontal } from 'lucide-react'
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
  categories: Array<{ name: string; count: number }>
  brands: string[]
  category?: string
  brand?: string
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
                Narrow the catalog by category or brand.
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
  categories,
  brands,
  category,
  brand,
  hasFilters,
  totalCatalogCount,
  closeOnSelect = false,
}: ProductFiltersProps & { closeOnSelect?: boolean }) {
  const link = (content: ReactNode) => closeOnSelect ? <SheetClose asChild>{content}</SheetClose> : content

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#728196]">Categories</h3>
          <div className="grid gap-2">
            {link(<FilterLink href="/products" active={!hasFilters} label="All Products" count={totalCatalogCount} />)}
            {categories.map((item) => link(
              <FilterLink
                key={item.name}
                href={`/products?category=${encodeURIComponent(item.name)}`}
                active={category === item.name}
                label={item.name}
                count={item.count}
              />
            ))}
          </div>
        </div>
      )}

      {brands.length > 0 && (
        <div className="border-t border-[#edf1f5] pt-5">
          <h3 className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#728196]">Brands</h3>
          <div className="grid gap-2">
            {brands.map((item) => link(
              <Link
                key={item}
                href={`/products?brand=${encodeURIComponent(item)}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                className={[
                  'rounded-lg px-3 py-2.5 text-sm font-black transition-colors',
                  brand?.toLowerCase() === item.toLowerCase()
                    ? 'bg-[#061f3f] text-white'
                    : 'text-[#4b5a6a] hover:bg-[#f4f7fa] hover:text-[#061f3f]',
                ].join(' ')}
              >
                {item}
              </Link>
            ))}
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
