import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderUserMenu } from '@/components/header-user-menu'
import { CartDrawer } from '@/components/cart-drawer'

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

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search industrial products, SKU, or categories..."
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] text-sm transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

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
              <Link
                href="/register"
                className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-[#003366] transition-colors"
              >
                Register
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
