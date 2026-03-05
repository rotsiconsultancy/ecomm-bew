'use client'

import { useTransition, useState } from 'react'
import { updateUserRole, type UserRole } from './actions'
import { Loader2 } from 'lucide-react'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin',     label: 'Admin' },
  { value: 'staff',     label: 'Staff' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'customer',  label: 'Customer' },
]

interface RoleSelectProps {
  userId:  string
  current: UserRole
}

export function RoleSelect({ userId, current }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as UserRole
    setError(null)
    startTransition(async () => {
      const result = await updateUserRole(userId, role)
      if (!result.success) setError(result.error ?? 'Failed to update role')
    })
  }

  return (
    <div className="relative">
      <select
        defaultValue={current}
        onChange={handleChange}
        disabled={isPending}
        className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 cursor-pointer"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      {isPending && (
        <Loader2 className="absolute -right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-slate-400" />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
