'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { banUser, unbanUser, deleteUser, updateUserProfile, type CombinedUser, type UserRole } from '../actions'
import { Card } from '@/components/ui/card'
import { Loader2, Save, Ban, ShieldOff, Trash2 } from 'lucide-react'

const ROLES: UserRole[] = ['admin', 'staff', 'wholesale', 'customer', 'supplier']

interface Props {
  user:    CombinedUser
  isAdmin: boolean
  isSelf:  boolean
}

export function UserDetailActions({ user, isAdmin, isSelf }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState<string | null>(null)
  const [success, setSuccess]        = useState(false)

  const [fullName, setFullName] = useState(user.full_name ?? '')
  const [phone, setPhone]       = useState(user.phone ?? '')
  const [role, setRole]         = useState<UserRole>(user.role)

  function handleSave() {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await updateUserProfile(user.id, { full_name: fullName, phone, role })
      if (result.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error ?? 'Failed to save')
      }
    })
  }

  function handleBanToggle() {
    if (user.is_banned) {
      startTransition(async () => { await unbanUser(user.id); router.refresh() })
    } else {
      if (!window.confirm(`Ban ${user.full_name ?? user.email}?`)) return
      startTransition(async () => { await banUser(user.id); router.refresh() })
    }
  }

  function handleDelete() {
    if (!window.confirm(
      `PERMANENTLY DELETE ${user.full_name ?? user.email}?\n\nThis action cannot be undone.`
    )) return
    startTransition(async () => {
      await deleteUser(user.id)
      router.push('/admin/user-management')
    })
  }

  return (
    <>
      {/* Edit profile */}
      <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 border-b pb-3">Edit Profile</h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white capitalize"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>

        {error   && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-green-600">Profile updated.</p>}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full h-9 flex items-center justify-center gap-2 bg-[#061f3f] hover:bg-[#03152d] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </Card>

      {/* Admin-only danger zone */}
      {isAdmin && (
        <Card className="p-6 rounded-2xl border-none shadow-sm space-y-3">
          <h3 className="font-bold text-red-500 border-b border-red-100 pb-3">Danger Zone</h3>

          <button
            onClick={handleBanToggle}
            disabled={isSelf || isPending}
            className={`w-full h-9 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
              user.is_banned
                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {user.is_banned
              ? <><ShieldOff className="w-4 h-4" /> Unban User</>
              : <><Ban className="w-4 h-4" /> Ban User</>}
          </button>

          <button
            onClick={handleDelete}
            disabled={isSelf || isPending}
            className="w-full h-9 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>

          {isSelf && (
            <p className="text-xs text-slate-400 text-center">
              You cannot modify your own account here.
            </p>
          )}
        </Card>
      )}
    </>
  )
}
