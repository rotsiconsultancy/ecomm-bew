import Link from 'next/link'
import { MessageSquare, Clock, Search, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  reviewing:  'bg-blue-100 text-blue-700',
  converted:  'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-600',
}

export default async function QuoteManagementPage() {
  const supabase = await createServiceClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, full_name, email, company, items, status, quote_type, created_at')
    .order('created_at', { ascending: false })

  const all       = quotes ?? []
  const pending   = all.filter((q) => q.status === 'pending').length
  const reviewing = all.filter((q) => q.status === 'reviewing').length
  const converted = all.filter((q) => q.status === 'converted').length

  const stats = [
    { label: 'Total Quotes',   value: all.length, icon: MessageSquare, color: 'text-[#061f3f]', bg: 'bg-blue-50' },
    { label: 'Pending',        value: pending,     icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Reviewing',      value: reviewing,   icon: Search,        color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Converted',      value: converted,   icon: TrendingUp,    color: 'text-green-600',  bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#061f3f]">Quote Management</h1>
        <p className="text-gray-500 mt-1">Review and manage all incoming quote requests.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5 rounded-2xl border-none shadow-sm">
            <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-extrabold text-[#061f3f]">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Name / Company</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {all.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No quote requests yet.
                  </td>
                </tr>
              ) : (
                all.map((q) => {
                  const itemCount = Array.isArray(q.items) ? q.items.length : 0
                  const status = q.status ?? 'pending'
                  return (
                    <tr key={q.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#061f3f]">{q.full_name}</p>
                        {q.company && <p className="text-xs text-gray-400">{q.company}</p>}
                        {q.quote_type === 'supplier_support' && (
                          <Badge className="mt-1 border-none bg-amber-100 text-amber-700">Supplier support</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{q.email}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{itemCount}</td>
                      <td className="px-6 py-4">
                        <Badge className={`border-none font-semibold capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(q.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/quote-management/${q.id}`}
                          className="text-[#ff5f14] hover:underline font-semibold text-xs"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
