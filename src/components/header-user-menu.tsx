'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AuthUser = { id: string; email: string }
type AuthProfile = { full_name: string | null; role: string }

interface HeaderUserMenuProps {
  user: AuthUser
  profile: AuthProfile
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function HeaderUserMenu({ user, profile }: HeaderUserMenuProps) {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const displayName = profile.full_name ?? user.email.split('@')[0]
  const initials = getInitials(displayName)
  const isAdmin = profile.role === 'admin' || profile.role === 'staff'

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
        aria-expanded={open}
      >
        <div className="w-9 h-9 rounded-full bg-[#003366] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-30 truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-[#003366] truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              My Profile
            </Link>

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Signing out…' : 'Log Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
