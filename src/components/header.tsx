'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderUserMenu } from '@/components/header-user-menu'
import { CartDrawer } from '@/components/cart-drawer'
import { SearchCommand } from '@/components/search-command'

type AuthUser = { id: string; email: string } | null
type AuthProfile = { full_name: string | null; role: string } | null

interface HeaderProps {
  user?: AuthUser
  profile?: AuthProfile
}

const categoryLinks = [
  { label: 'All Products', href: '/products' },
  { label: 'Silicones', href: '/products?category=Silicones' },
  { label: 'Sealants', href: '/products?category=Sealants' },
  { label: 'Adhesives', href: '/products?category=Adhesives' },
  { label: 'Abrasives', href: '/products?category=Abrasives' },
]

const utilityLinks = [
  { label: 'Order history', href: '/order-history' },
  { label: 'Bulk order', href: '/request-quote' },
  { label: 'Technical resources', href: '/resources' },
]

export function Header({ user = null, profile = null }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d8e0ea] bg-white/95 backdrop-blur-xl">
      <div className="bg-[#03152d] text-white">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs font-black sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#3b7a57] shadow-[0_0_0_4px_rgba(59,122,87,0.24)]" />
            <span className="truncate">Search the catalog, buy stocked items, or request a procurement quote.</span>
          </div>
          <div className="hidden items-center gap-6 lg:flex">
            <span>Nairobi operations</span>
            <span>Quality construction materials</span>
          </div>
        </div>
      </div>

      <nav className="mx-auto grid min-h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Bewama home">
          <Image
            src="/logo.png"
            alt="Bewama"
            width={196}
            height={74}
            priority
            className="h-auto w-40 sm:w-48"
          />
        </Link>

        <SearchCommand />

        <div className="flex items-center justify-end gap-2">
          {user && profile ? (
            <HeaderUserMenu user={user} profile={profile} />
          ) : (
            <Link
              href="/login"
              className="hidden text-sm font-black text-[#061f3f] transition-colors hover:text-[#ff5f14] md:inline-flex"
            >
              Log In
            </Link>
          )}

          <CartDrawer />

          <Button
            asChild
            className="hidden rounded-lg bg-[#ff5f14] px-5 font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#e84f0a] sm:inline-flex"
          >
            <Link href="/request-quote">Request Quote</Link>
          </Button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-lg border border-[#d8e0ea] bg-white text-[#061f3f] transition-colors hover:border-[#ff5f14]/50 hover:bg-[#fff8f4] lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="hidden border-t border-[#edf1f5] bg-white/90 lg:block">
        <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 text-sm font-black text-[#061f3f]">
            {categoryLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-[#e84f0a]">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-6 text-sm font-black text-[#4b5a6a]">
            {utilityLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-[#e84f0a]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={menuOpen ? 'grid border-t border-[#edf1f5] bg-white px-4 pb-4 sm:px-6 lg:hidden' : 'hidden'}>
        <div className="grid gap-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {[...categoryLinks, ...utilityLinks].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center rounded-lg border border-[#d8e0ea] bg-white px-3 text-sm font-black text-[#061f3f]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button asChild className="mt-2 rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
            <Link href="/request-quote" onClick={() => setMenuOpen(false)}>Request Quote</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
