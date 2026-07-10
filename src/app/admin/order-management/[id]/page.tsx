import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServiceClient } from '@/lib/supabase/server'
import { OrderActions } from './order-actions'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-blue-100 text-blue-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
}

type Props = { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const [{ data: fulfilments }, { data: supportRequests }] = await Promise.all([
    supabase
      .from('supplier_fulfilments')
      .select('*, suppliers(company_name)')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('quotes')
      .select('id, status, items, supplier_id, delivery_region_id, created_at')
      .eq('source_order_id', id)
      .eq('quote_type', 'supplier_support')
      .order('created_at', { ascending: true }),
  ])

  if (!order) notFound()

  const addr  = (order.shipping_address ?? {}) as { full_name?: string; phone?: string; email?: string; delivery_address?: string; city?: string; notes?: string }
  const items = (order.items ?? []) as { product_id: string | null; name: string; price: number; currency: string; quantity: number; image: string | null }[]
  const status = order.status ?? 'pending'
  const symbol = order.currency === 'KES' ? 'KES ' : order.currency + ' '

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/order-management" className="text-gray-400 hover:text-[#061f3f] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#061f3f]">Order Detail</h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{order.id}</p>
        </div>
        <Badge className={`ml-auto border-none font-semibold capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
          {status}
        </Badge>
      </div>

      {/* Shipping Details */}
      <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
        <h2 className="font-bold text-[#061f3f] border-b pb-2">Shipping Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Full Name</p>
            <p className="font-semibold text-gray-800">{addr.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Phone</p>
            <p className="font-semibold text-gray-800">{addr.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Email</p>
            <p className="font-semibold text-gray-800">{addr.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">City</p>
            <p className="font-semibold text-gray-800">{addr.city ?? '—'}</p>
          </div>
          {addr.delivery_address && (
            <div className="col-span-2">
              <p className="text-gray-400 text-xs font-semibold uppercase">Address</p>
              <p className="font-semibold text-gray-800">{addr.delivery_address}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-gray-400 text-xs font-semibold uppercase">Ordered</p>
            <p className="font-semibold text-gray-800">
              {new Date(order.created_at).toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>
        </div>
      </Card>

      {/* Items */}
      <Card className="p-6 rounded-2xl border-none shadow-sm">
        <h2 className="font-bold text-[#061f3f] border-b pb-2 mb-4">Order Items</h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-[#061f3f]">
                {symbol}{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 mt-3 flex justify-between font-extrabold text-[#061f3f]">
          <span>Total</span>
          <span>{symbol}{Number(order.total_amount).toLocaleString()}</span>
        </div>
      </Card>

      {fulfilments && fulfilments.length > 0 && (
        <Card className="p-6 rounded-2xl border-none shadow-sm">
          <h2 className="font-bold text-[#061f3f] border-b pb-2 mb-4">Fulfilment Sections</h2>
          <div className="space-y-3">
            {fulfilments.map((fulfilment) => {
              const fulfilmentItems = (fulfilment.items ?? []) as { name: string; quantity: number; price: number; currency: string }[]
              const fulfilmentTotal = Number(fulfilment.subtotal_amount ?? 0) + Number(fulfilment.delivery_fee ?? 0)
              return (
                <div key={fulfilment.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-[#061f3f]">
                        {fulfilment.fulfilment_owner === 'bewama'
                          ? 'Bewama fulfilment'
                          : fulfilment.suppliers?.company_name ?? 'Supplier fulfilment'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {fulfilmentItems.length} item{fulfilmentItems.length !== 1 ? 's' : ''} · Delivery {symbol}{Number(fulfilment.delivery_fee ?? 0).toLocaleString()}
                        {fulfilment.lead_time_min_days !== null && fulfilment.lead_time_max_days !== null
                          ? ` · ${fulfilment.lead_time_min_days}-${fulfilment.lead_time_max_days} days`
                          : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="border-none bg-white text-[#061f3f] capitalize">{fulfilment.status}</Badge>
                      <p className="mt-2 font-extrabold text-[#061f3f]">{symbol}{fulfilmentTotal.toLocaleString()}</p>
                    </div>
                  </div>
                  {fulfilment.rejected_reason && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      Rejected: {fulfilment.rejected_reason}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {supportRequests && supportRequests.length > 0 && (
        <Card className="p-6 rounded-2xl border-none shadow-sm">
          <h2 className="font-bold text-[#061f3f] border-b pb-2 mb-4">Linked Support Requests</h2>
          <div className="space-y-2">
            {supportRequests.map((request) => {
              const requestItems = (request.items ?? []) as { product_name: string; quantity: number; unit: string }[]
              return (
                <Link
                  key={request.id}
                  href={`/admin/quote-management/${request.id}`}
                  className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm transition-colors hover:bg-amber-100"
                >
                  <div>
                    <p className="font-bold text-[#061f3f]">Support ref #{request.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-amber-800">{requestItems.length} item{requestItems.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Badge className="border-none bg-white text-amber-700 capitalize">{request.status}</Badge>
                </Link>
              )
            })}
          </div>
        </Card>
      )}

      {/* Notes */}
      {order.notes && (
        <Card className="p-6 rounded-2xl border-none shadow-sm">
          <h2 className="font-bold text-[#061f3f] border-b pb-2 mb-3">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
        </Card>
      )}

      {/* Actions */}
      <OrderActions orderId={order.id} currentStatus={status} currentNotes={order.notes ?? ''} />
    </div>
  )
}
