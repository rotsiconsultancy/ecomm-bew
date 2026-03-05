import { Metadata } from 'next'
import Link from 'next/link'
import {
  DollarSign, ShoppingCart, MessageSquare, Package,
  Clock, Truck, CheckCircle2, AlertTriangle, Users,
  FileText, Edit2, TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/admin/stat-card'
import { fetchDashboardData } from './data'
import { formatCurrency, formatPercent, timeAgo, shortenId } from '@/lib/format'

export const metadata: Metadata = { title: 'Dashboard | Bewama Admin' }
export const revalidate = 300

// ─── Status styles ────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
}

const QUOTE_STATUS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  responded: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const d = await fetchDashboardData()

  const revenueChangeColor = d.revenue.change_percent >= 0 ? 'green' : 'red'
  const totalOrders = d.orders.total

  // For the order status bar widths
  const pct = (n: number) => (totalOrders === 0 ? 0 : Math.round((n / totalOrders) * 100))

  return (
    <div className="space-y-8">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#003366]">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening right now.</p>
      </div>

      {/* ── Row 1 — 4 KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(d.revenue.total)}
          subtext={`${formatPercent(d.revenue.change_percent)} from last month`}
          subtextColor={revenueChangeColor}
          icon={DollarSign}
          iconBg="bg-blue-50"
          iconColor="text-[#003366]"
        />
        <StatCard
          title="Total Orders"
          value={d.orders.total}
          subtext={`${d.orders.pending} pending`}
          subtextColor={d.orders.pending > 0 ? 'red' : 'gray'}
          icon={ShoppingCart}
          iconBg="bg-orange-50"
          iconColor="text-[#ec5b13]"
        />
        <StatCard
          title="Total Quotes"
          value={d.quotes.total}
          subtext={`${d.quotes.conversion_rate.toFixed(1)}% conversion rate`}
          subtextColor="gray"
          icon={MessageSquare}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Active Products"
          value={d.products.total}
          subtext={d.products.out_of_stock > 0 ? `${d.products.out_of_stock} out of stock` : 'All in stock'}
          subtextColor={d.products.out_of_stock > 0 ? 'red' : 'green'}
          icon={Package}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* ── Row 2 — Recent Orders (60%) + Recent Quotes (40%) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Recent Orders — col-span-3 ≈ 60% */}
        <Card className="lg:col-span-3 rounded-2xl border-none shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#003366]">Recent Orders</h2>
            <Link
              href="/admin/order-management"
              className="text-xs font-semibold text-[#ec5b13] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {d.orders.recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No orders yet.</td>
                  </tr>
                ) : (
                  d.orders.recent.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/order-management/${o.id}`}
                          className="font-bold text-[#003366] hover:text-[#ec5b13] font-mono text-xs transition-colors"
                        >
                          {shortenId(o.id)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{o.customer_name}</td>
                      <td className="px-6 py-4 font-bold text-[#003366]">{formatCurrency(o.total_amount, o.currency)}</td>
                      <td className="px-6 py-4">
                        <Badge className={`border-none capitalize font-semibold ${ORDER_STATUS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(o.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Quotes — col-span-2 ≈ 40% */}
        <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#003366]">Recent Quotes</h2>
            <Link
              href="/admin/quote-management"
              className="text-xs font-semibold text-[#ec5b13] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {d.quotes.recent.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">No quotes yet.</p>
            ) : (
              d.quotes.recent.map((q) => (
                <Link
                  key={q.id}
                  href={`/admin/quote-management/${q.id}`}
                  className="flex items-start justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-semibold text-[#003366] text-sm truncate">{q.full_name}</p>
                    {q.company && (
                      <p className="text-xs text-gray-400 truncate">{q.company}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{q.item_count} item{q.item_count !== 1 ? 's' : ''} · {timeAgo(q.created_at)}</p>
                  </div>
                  <Badge className={`border-none capitalize font-semibold shrink-0 ${QUOTE_STATUS[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {q.status}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ── Row 3 — Status Breakdown / Low Stock / Quick Stats ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Order Status Breakdown */}
        <Card className="p-6 rounded-2xl border-none shadow-sm">
          <h2 className="font-bold text-[#003366] mb-5">Order Status Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Pending',    count: d.orders.pending,    dot: 'bg-yellow-400' },
              { label: 'Processing', count: d.orders.processing, dot: 'bg-purple-400' },
              { label: 'Shipped',    count: d.orders.shipped,    dot: 'bg-blue-400' },
              { label: 'Delivered',  count: d.orders.delivered,  dot: 'bg-green-400' },
            ].map(({ label, count, dot }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
                    <span className="font-medium text-gray-700">{label}</span>
                  </div>
                  <span className="font-bold text-[#003366]">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dot} transition-all`}
                    style={{ width: `${pct(count)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">This month</span>
            <span className="font-bold text-[#003366]">{d.orders.this_month} orders</span>
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6 rounded-2xl border-none shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-[#ec5b13]" />
            <h2 className="font-bold text-[#003366]">Low Stock Alert</h2>
          </div>

          {d.products.low_stock.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold py-4">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              All products well stocked
            </div>
          ) : (
            <div className="space-y-3">
              {d.products.low_stock.map((p) => (
                <Link
                  key={p.id}
                  href="/admin/product-management"
                  className="flex items-center justify-between py-2 border-b last:border-0 hover:opacity-75 transition-opacity"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                  </div>
                  <span
                    className={`text-xs font-extrabold shrink-0 ${
                      p.stock <= 5 ? 'text-red-500' : 'text-[#ec5b13]'
                    }`}
                  >
                    {p.stock} left
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            {d.products.low_stock_count} product{d.products.low_stock_count !== 1 ? 's' : ''} with stock ≤ 10
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6 rounded-2xl border-none shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[#003366]" />
            <h2 className="font-bold text-[#003366]">Quick Stats</h2>
          </div>
          <div className="space-y-4">
            {[
              { icon: Users,       label: 'New users this month',  value: d.users.new_this_month,   color: 'bg-blue-50',   iconColor: 'text-blue-600' },
              { icon: Users,       label: 'Wholesale buyers',      value: d.users.wholesale,        color: 'bg-orange-50', iconColor: 'text-[#ec5b13]' },
              { icon: FileText,    label: 'Published posts',       value: d.blog.published,         color: 'bg-green-50',  iconColor: 'text-green-600' },
              { icon: Edit2,       label: 'Draft posts',           value: d.blog.draft,             color: 'bg-gray-50',   iconColor: 'text-gray-500' },
            ].map(({ icon: Icon, label, value, color, iconColor }) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${color} shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-extrabold text-[#003366]">{value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-[#003366]">{d.users.total}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total users</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#003366]">{d.products.quote_only}</p>
              <p className="text-xs text-gray-400 mt-0.5">Quote-only products</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
