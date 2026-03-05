import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminContext } from '@/lib/auth'
import { getUserById } from '../actions'
import { createServiceClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Mail, Phone, Shield, Calendar, Clock, Ban, ShieldOff } from 'lucide-react'
import { UserDetailActions } from './user-detail-actions'

type Props = { params: Promise<{ id: string }> }

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

const ROLE_BADGE: Record<string, string> = {
  admin:     'bg-[#003366]/10 text-[#003366] border-[#003366]/20',
  staff:     'bg-blue-50 text-blue-700 border-blue-200',
  wholesale: 'bg-orange-50 text-[#ec5b13] border-orange-200',
  customer:  'bg-slate-50 text-slate-600 border-slate-200',
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params
  const { user: currentUser, profile: currentProfile } = await getAdminContext()

  const targetUser = await getUserById(id)
  if (!targetUser) notFound()

  // Fetch quote history
  const supabase = await createServiceClient()
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, product_name, status, created_at, quantity')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const isSelf    = currentUser.id === id
  const isAdmin   = currentProfile.role === 'admin'
  const badgeCls  = ROLE_BADGE[targetUser.role] ?? 'bg-slate-50 text-slate-600 border-slate-200'

  const initials = (() => {
    if (targetUser.full_name) {
      const parts = targetUser.full_name.trim().split(' ')
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0][0].toUpperCase()
    }
    return targetUser.email[0].toUpperCase()
  })()

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Back */}
      <Link
        href="/admin/user-management"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#003366] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#003366] text-white flex items-center justify-center text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">
              {targetUser.full_name ?? <span className="text-slate-400 italic font-normal">No name set</span>}
              {isSelf && (
                <span className="ml-3 text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold">You</span>
              )}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{targetUser.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${badgeCls} capitalize`}>
                {targetUser.role}
              </span>
              {targetUser.is_banned && (
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-600 border border-red-200">
                  Banned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Details card */}
          <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 border-b pb-3">Account Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-slate-700">{targetUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-slate-700">{targetUser.phone ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Role</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{targetUser.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Joined</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(targetUser.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Last Sign In</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(targetUser.last_sign_in_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {targetUser.is_banned
                  ? <Ban className="w-4 h-4 text-red-400 shrink-0" />
                  : <ShieldOff className="w-4 h-4 text-green-500 shrink-0" />}
                <div>
                  <p className="text-xs text-slate-400 font-medium">Status</p>
                  <p className={`text-sm font-semibold ${targetUser.is_banned ? 'text-red-500' : 'text-green-600'}`}>
                    {targetUser.is_banned ? 'Banned' : 'Active'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quote history */}
          <Card className="p-6 rounded-2xl border-none shadow-sm">
            <h2 className="font-bold text-slate-800 border-b pb-3 mb-4">Quote History</h2>
            {!quotes || quotes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No quotes submitted yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b">
                    <th className="pb-3 text-left">Product</th>
                    <th className="pb-3 text-left">Qty</th>
                    <th className="pb-3 text-left">Status</th>
                    <th className="pb-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-700">{q.product_name ?? '—'}</td>
                      <td className="py-3 text-slate-500">{q.quantity ?? '—'}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                          q.status === 'approved'  ? 'bg-green-100 text-green-600' :
                          q.status === 'rejected'  ? 'bg-red-100 text-red-600' :
                          q.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-xs">{formatDate(q.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          <UserDetailActions
            user={targetUser}
            isAdmin={isAdmin}
            isSelf={isSelf}
          />
        </div>
      </div>
    </div>
  )
}
