'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { banUser, unbanUser, deleteUser, type CombinedUser } from './actions'
import { RoleSelect } from './role-select'
import { Ban, ShieldOff, Trash2, ExternalLink, Search } from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return email[0].toUpperCase()
}

const ROLE_COLORS: Record<string, string> = {
  admin:     'bg-[#003366] text-white',
  staff:     'bg-blue-600 text-white',
  wholesale: 'bg-[#ec5b13] text-white',
  customer:  'bg-slate-400 text-white',
}

const ROLE_BADGE: Record<string, string> = {
  admin:     'bg-[#003366]/10 text-[#003366] border-[#003366]/20',
  staff:     'bg-blue-50 text-blue-700 border-blue-200',
  wholesale: 'bg-orange-50 text-[#ec5b13] border-orange-200',
  customer:  'bg-slate-50 text-slate-600 border-slate-200',
}

// ─── Ban/Unban Button ────────────────────────────────────────────────────────

function BanButton({
  user,
  disabled,
}: {
  user: CombinedUser
  disabled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      if (user.is_banned) {
        await unbanUser(user.id)
      } else {
        if (!window.confirm(`Ban ${user.full_name ?? user.email}? They won't be able to log in.`)) return
        await banUser(user.id)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isPending}
      title={user.is_banned ? 'Unban user' : 'Ban user'}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
        user.is_banned
          ? 'text-green-600 hover:bg-green-50'
          : 'text-amber-500 hover:bg-amber-50'
      }`}
    >
      {user.is_banned
        ? <ShieldOff className="w-4 h-4" />
        : <Ban className="w-4 h-4" />}
    </button>
  )
}

// ─── Delete Button ───────────────────────────────────────────────────────────

function DeleteButton({
  user,
  disabled,
}: {
  user: CombinedUser
  disabled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (
      !window.confirm(
        `PERMANENTLY DELETE ${user.full_name ?? user.email}?\n\nThis hard-deletes their account from the auth system and cannot be undone.`
      )
    ) return

    startTransition(async () => {
      await deleteUser(user.id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isPending}
      title="Delete user"
      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

// ─── Main Table ──────────────────────────────────────────────────────────────

interface UserTableProps {
  users:           CombinedUser[]
  currentUserId:   string
  currentUserRole: string
}

export function UserTable({ users, currentUserId, currentUserRole }: UserTableProps) {
  const [query, setQuery] = useState('')

  const isAdmin = currentUserRole === 'admin'

  const filtered = query.trim()
    ? users.filter((u) => {
        const q = query.toLowerCase()
        return (
          u.email.toLowerCase().includes(q) ||
          (u.full_name?.toLowerCase().includes(q) ?? false)
        )
      })
    : users

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Seen</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {query ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isSelf    = user.id === currentUserId
                  const initials  = getInitials(user.full_name, user.email)
                  const avatarCls = ROLE_COLORS[user.role] ?? 'bg-slate-400 text-white'
                  const badgeCls  = ROLE_BADGE[user.role]  ?? 'bg-slate-50 text-slate-600 border-slate-200'

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 group">
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarCls}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {user.full_name ?? <span className="text-slate-400 italic">No name</span>}
                              {isSelf && (
                                <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">You</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${badgeCls} capitalize mr-2`}>
                            {user.role}
                          </span>
                          <RoleSelect userId={user.id} current={user.role} />
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Last Seen */}
                      <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(user.last_sign_in_at)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {user.is_banned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/user-management/${user.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#003366] hover:bg-slate-100 transition-colors"
                            title="View profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {isAdmin && (
                            <>
                              <BanButton user={user} disabled={isSelf} />
                              <DeleteButton user={user} disabled={isSelf} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              {filtered.length === users.length
                ? `${users.length} user${users.length !== 1 ? 's' : ''} total`
                : `${filtered.length} of ${users.length} users`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
