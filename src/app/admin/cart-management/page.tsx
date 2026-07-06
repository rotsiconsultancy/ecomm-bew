import { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Users, AlertTriangle, CheckCircle2, Package } from 'lucide-react'
import { formatCurrency, timeAgo, shortenId } from '@/lib/format'

export const metadata: Metadata = { title: 'Cart Management | Bewama Admin' }
export const dynamic = 'force-dynamic'

interface CartItem {
  product_id: string
  name: string
  price: number
  currency: string
  quantity: number
  image: string | null
}

interface CartRow {
  id: string
  user_id: string | null
  session_id: string | null
  items: CartItem[]
  status: 'active' | 'converted' | 'abandoned'
  created_at: string
  updated_at: string
  profiles: { full_name: string | null; role: string } | null
}

function cartTotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.price * i.quantity, 0)
}

function isAbandoned(row: CartRow): boolean {
  if (row.status !== 'active') return false
  const ageMs = Date.now() - new Date(row.updated_at).getTime()
  return ageMs > 2 * 60 * 60 * 1000 // >2h with no update
}

export default async function CartManagementPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: rawCarts } = await supabase
    .from('carts')
    .select('id, user_id, session_id, items, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)

  // Fetch profiles separately — carts.user_id → auth.users, not profiles directly
  const userIds = [...new Set((rawCarts ?? []).map((c) => c.user_id).filter(Boolean) as string[])]
  const profileMap: Record<string, { full_name: string | null; role: string }> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', userIds)
    profiles?.forEach((p) => { profileMap[p.id] = { full_name: p.full_name, role: p.role } })
  }

  const carts: CartRow[] = (rawCarts ?? []).map((c) => ({
    ...c,
    items: (c.items ?? []) as CartItem[],
    profiles: c.user_id ? (profileMap[c.user_id] ?? null) : null,
  }))

  const active    = carts.filter((c) => c.status === 'active' && !isAbandoned(c))
  const abandoned = carts.filter((c) => isAbandoned(c))
  const converted = carts.filter((c) => c.status === 'converted')

  const totalCartValue = active.reduce((s, c) => s + cartTotal(c.items), 0)
  const abandonedValue = abandoned.reduce((s, c) => s + cartTotal(c.items), 0)

  const stats = [
    { label: 'Active Carts',    value: active.length,    sub: formatCurrency(totalCartValue), icon: ShoppingCart, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Abandoned Carts', value: abandoned.length, sub: formatCurrency(abandonedValue), icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Converted',       value: converted.length, sub: 'Orders placed',                icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Total Sessions',  value: carts.length,     sub: 'All time',                     icon: Users,        color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#061f3f]">Cart Management</h1>
        <p className="text-gray-500 mt-1">Live cart sessions, abandoned carts, and recovery insights.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5 rounded-2xl border-none shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-extrabold text-[#061f3f]">{value}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Abandoned carts (priority) */}
      {abandoned.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#061f3f] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Abandoned Carts
            <Badge className="bg-orange-100 text-orange-600 border-none">{abandoned.length}</Badge>
          </h2>
          <CartTable rows={abandoned} />
        </div>
      )}

      {/* Active carts */}
      <div>
        <h2 className="text-lg font-bold text-[#061f3f] mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-500" />
          Active Carts
          <Badge className="bg-blue-100 text-blue-600 border-none">{active.length}</Badge>
        </h2>
        {active.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No active carts right now.</div>
        ) : (
          <CartTable rows={active} />
        )}
      </div>

      {/* Converted carts */}
      {converted.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#061f3f] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Converted to Orders
            <Badge className="bg-green-100 text-green-600 border-none">{converted.length}</Badge>
          </h2>
          <CartTable rows={converted} />
        </div>
      )}
    </div>
  )
}

// ─── Table component ──────────────────────────────────────────────────────────

function CartTable({ rows }: { rows: CartRow[] }) {
  return (
    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cart ID</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((cart) => {
              const total   = cartTotal(cart.items)
              const name    = cart.profiles?.full_name ?? null
              const currency = cart.items[0]?.currency ?? 'KES'
              const abandoned = isAbandoned(cart)

              return (
                <tr key={cart.id} className="hover:bg-gray-50 transition-colors">
                  {/* ID */}
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">
                    #{shortenId(cart.id)}
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">
                    {name ? (
                      <div>
                        <p className="font-semibold text-[#061f3f]">{name}</p>
                        <p className="text-xs text-gray-400">{cart.profiles?.role}</p>
                      </div>
                    ) : cart.user_id ? (
                      <span className="text-gray-500 text-xs">Registered user</span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Guest · {cart.session_id?.slice(0, 8)}</span>
                    )}
                  </td>

                  {/* Items */}
                  <td className="px-5 py-4">
                    {cart.items.length === 0 ? (
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> Empty
                      </span>
                    ) : (
                      <div className="space-y-0.5">
                        {cart.items.slice(0, 2).map((item) => (
                          <p key={item.product_id} className="text-gray-700">
                            <span className="font-medium">{item.quantity}×</span>{' '}
                            <span className="truncate max-w-40 inline-block align-bottom">{item.name}</span>
                          </p>
                        ))}
                        {cart.items.length > 2 && (
                          <p className="text-xs text-gray-400">+{cart.items.length - 2} more</p>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Value */}
                  <td className="px-5 py-4 font-bold text-[#061f3f]">
                    {total > 0 ? formatCurrency(total, currency) : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Last active */}
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {timeAgo(cart.updated_at)}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {cart.status === 'converted' ? (
                      <Badge className="bg-green-100 text-green-700 border-none text-xs">Converted</Badge>
                    ) : abandoned ? (
                      <Badge className="bg-orange-100 text-orange-600 border-none text-xs">Abandoned</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-600 border-none text-xs">Active</Badge>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
