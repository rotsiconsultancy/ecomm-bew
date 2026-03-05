import { getAdminContext } from '@/lib/auth'
import { getUsers } from './actions'
import { UserTable } from './user-table'
import { Users, ShoppingBag, Ban } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default async function UserManagementPage() {
  const { user, profile } = await getAdminContext()
  const users = await getUsers()

  const total     = users.length
  const wholesale = users.filter((u) => u.role === 'wholesale').length
  const banned    = users.filter((u) => u.is_banned).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage accounts, roles, and access across the platform.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
            <p className="text-2xl font-extrabold text-[#003366]">{total}</p>
            <p className="text-xs text-gray-400">{users.filter((u) => !u.is_banned).length} active</p>
          </div>
        </Card>

        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-orange-100 text-[#ec5b13] rounded-full flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Wholesale Buyers</p>
            <p className="text-2xl font-extrabold text-[#003366]">{wholesale}</p>
            <p className="text-xs text-gray-400">Approved accounts</p>
          </div>
        </Card>

        <Card className="rounded-xl border-none shadow-sm p-6 flex items-center gap-6">
          <div className="h-12 w-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center shrink-0">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Banned Users</p>
            <p className="text-2xl font-extrabold text-[#003366]">{banned}</p>
            <p className="text-xs text-gray-400">Restricted from login</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        currentUserId={user.id}
        currentUserRole={profile.role}
      />
    </div>
  )
}
