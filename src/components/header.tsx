import Link from 'next/link'
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

export function Header({ user = null, profile = null }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="shrink-0 flex items-center">
          <Link href="/" className="text-3xl font-extrabold text-[#003366] tracking-tight">
            BEWAMA
          </Link>
        </div>

        {/* Search */}
        <SearchCommand />

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user && profile ? (
            <HeaderUserMenu user={user} profile={profile} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-[#003366] font-semibold hover:text-[#001f3f] text-sm transition-colors"
              >
                Log In
              </Link>
            </>
          )}

          <CartDrawer />

          <Button
            asChild
            className="bg-[#ec5b13] hover:bg-[#d14d0d] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95"
          >
            <Link href="/request-quote">Request Quote</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}