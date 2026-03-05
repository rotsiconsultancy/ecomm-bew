import Link from 'next/link'
import { ShoppingCart, Clock, Truck, CheckCircle2, Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-blue-100 text-blue-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
}

const STATUS_ICON: Record<string, React.ElementType> = {
  pending:    Clock,
  processing: Package,
  shipped:    Truck,
  delivered:  CheckCircle2,
  cancelled:  Clock,
}

export default async function OrderManagementPage() {
  const supabase = await createServiceClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, shipping_address, items, total_amount, currency, status, created_at')
    .order('created_at', { ascending: false })

  const all       = orders ?? []
  const pending   = all.filter((o) => o.status === 'pending').length
  const shipped   = all.filter((o) => o.status === 'shipped').length
  const delivered = all.filter((o) => o.status === 'delivered').length

  const stats = [
    { label: 'Total Orders', value: all.length, icon: ShoppingCart,  color: 'text-[#003366]',  bg: 'bg-blue-50' },
    { label: 'Pending',      value: pending,     icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Shipped',      value: shipped,     icon: Truck,         color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Delivered',    value: delivered,   icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#003366]">Order Management</h1>
        <p className="text-gray-500 mt-1">Monitor and update all customer orders.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5 rounded-2xl border-none shadow-sm">
            <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-extrabold text-[#003366]">{value}</p>
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
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {all.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                all.map((o) => {
                  const addr = o.shipping_address as { full_name?: string; city?: string } | null
                  const itemCount = Array.isArray(o.items) ? o.items.length : 0
                  const status = o.status ?? 'pending'
                  const StatusIcon = STATUS_ICON[status] ?? Clock
                  const symbol = o.currency === 'KES' ? 'KES ' : o.currency + ' '
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#003366]">{addr?.full_name ?? '—'}</p>
                        {addr?.city && <p className="text-xs text-gray-400">{addr.city}</p>}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{itemCount}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#003366]">
                        {symbol}{Number(o.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`border-none font-semibold capitalize flex items-center gap-1 w-fit ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(o.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/order-management/${o.id}`}
                          className="text-[#ec5b13] hover:underline font-semibold text-xs"
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
