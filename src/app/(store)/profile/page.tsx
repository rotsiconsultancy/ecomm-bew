import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  LayoutDashboard, ShoppingCart, Settings,
  Package, MessageSquare, ChevronRight, Clock, Star,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserPointsBalance } from '@/lib/points'
import { POINTS_TO_KES } from '@/types/points'
import { LogoutButton } from '@/components/logout-button'

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin Account',
  staff: 'Staff Member',
  wholesale: 'Wholesale Partner',
  customer: 'Customer',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const pointsBalance = await getUserPointsBalance(user.id)
  const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'User'
  const initials = getInitials(displayName)
  const roleLabel = ROLE_LABELS[profile?.role ?? 'customer'] ?? 'Customer'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* Sidebar nav */}
        <aside className="w-full lg:w-80 space-y-6">
          {/* Avatar card */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
            <div className="h-24 w-24 bg-[#003366]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#003366]">
              <span className="text-3xl font-bold text-[#003366]">{initials}</span>
            </div>
            <h3 className="text-xl font-bold text-[#003366]">{displayName}</h3>
            <p className="text-sm text-gray-400 mt-1">{user.email}</p>
            <Badge className="mt-3 bg-[#ec5b13] hover:bg-[#d14d0d] text-white border-none">
              {roleLabel}
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Link
              href="/profile"
              className="flex items-center gap-4 px-6 py-4 bg-[#003366] text-white font-bold"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Account Overview</span>
            </Link>
            <Link
              href="/order-history"
              className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-[#003366] transition-colors border-b"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Order History</span>
            </Link>
            <Link
              href="/request-quote"
              className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-[#003366] transition-colors border-b"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Quote Requests</span>
            </Link>
            <Link
              href="/account/points"
              className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-[#003366] transition-colors border-b"
            >
              <Star className="h-5 w-5" />
              <span>Bewama Points</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-[#003366] transition-colors border-b"
            >
              <Settings className="h-5 w-5" />
              <span>Account Settings</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-[#003366] transition-colors border-b"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <LogoutButton className="flex items-center gap-4 px-6 py-4 text-red-600 hover:bg-red-50 w-full transition-colors" />
          </nav>
        </aside>

        {/* Main content */}
        <div className="lg:flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-extrabold text-[#003366]">Account Overview</h1>
            <Button className="bg-[#ec5b13] hover:bg-[#d14d0d] text-white rounded-lg font-bold">
              Edit Profile
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-xl border-gray-100 shadow-sm p-6 space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-extrabold text-[#003366]">—</p>
              <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                No orders yet
              </p>
            </Card>
            <Card className="rounded-xl border-gray-100 shadow-sm p-6 space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Quotes</p>
              <p className="text-3xl font-extrabold text-[#003366]">—</p>
              <p className="text-xs text-[#ec5b13] font-bold flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Awaiting review
              </p>
            </Card>
            <Card className="rounded-xl border-gray-100 shadow-sm p-6 space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Tier</p>
              <p className="text-3xl font-extrabold text-[#003366] capitalize">
                {profile?.role ?? 'customer'}
              </p>
              <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                <Package className="h-3 w-3" />
                {roleLabel}
              </p>
            </Card>
            <Link href="/account/points">
              <Card className="rounded-xl border-gray-100 shadow-sm p-6 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bewama Points</p>
                <p className="text-3xl font-extrabold text-[#ec5b13]">
                  {pointsBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 text-[#ec5b13]" />
                  ≈ KES {(pointsBalance * POINTS_TO_KES).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </p>
              </Card>
            </Link>
          </div>

          {/* Account details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#003366]">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                <p className="text-base font-semibold text-gray-800">
                  {profile?.full_name ?? <span className="text-gray-400 italic">Not set</span>}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="text-base font-semibold text-gray-800">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                <p className="text-base font-semibold text-gray-800">
                  {profile?.phone ?? <span className="text-gray-400 italic">Not set</span>}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Role</p>
                <p className="text-base font-semibold text-gray-800 capitalize">
                  {profile?.role ?? 'customer'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#003366]">Recent Activity</h2>
              <Link href="/order-history" className="text-sm font-bold text-[#ec5b13] hover:underline">
                View All →
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-12 text-center text-gray-400">
                <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No recent activity yet.</p>
                <p className="text-xs mt-1">Your orders and quotes will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
