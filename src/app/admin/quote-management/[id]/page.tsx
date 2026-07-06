import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServiceClient } from '@/lib/supabase/server'
import { QuoteActions } from './quote-actions'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  converted: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
}

type Props = { params: Promise<{ id: string }> }

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!quote) notFound()

  const items = (quote.items ?? []) as { product_name: string; quantity: number; unit: string }[]
  const status = quote.status ?? 'pending'

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/quote-management" className="text-gray-400 hover:text-[#061f3f] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#061f3f]">Quote Detail</h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{quote.id}</p>
        </div>
        <Badge className={`ml-auto border-none font-semibold capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
          {status}
        </Badge>
      </div>

      {/* Contact Info */}
      <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
        <h2 className="font-bold text-[#061f3f] border-b pb-2">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Full Name</p>
            <p className="font-semibold text-gray-800">{quote.full_name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Email</p>
            <p className="font-semibold text-gray-800">{quote.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Phone</p>
            <p className="font-semibold text-gray-800">{quote.phone}</p>
          </div>
          {quote.company && (
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase">Company</p>
              <p className="font-semibold text-gray-800">{quote.company}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-gray-400 text-xs font-semibold uppercase">Submitted</p>
            <p className="font-semibold text-gray-800">
              {new Date(quote.created_at).toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>
        </div>
      </Card>

      {/* Message */}
      {quote.message && (
        <Card className="p-6 rounded-2xl border-none shadow-sm">
          <h2 className="font-bold text-[#061f3f] border-b pb-2 mb-3">Message</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.message}</p>
        </Card>
      )}

      {/* Items */}
      <Card className="p-6 rounded-2xl border-none shadow-sm">
        <h2 className="font-bold text-[#061f3f] border-b pb-2 mb-4">Products Requested</h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
              <span className="font-semibold text-gray-800">{item.product_name || '—'}</span>
              <span className="text-gray-500">{item.quantity} {item.unit}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <QuoteActions quoteId={quote.id} currentStatus={status} adminNotes={quote.admin_notes ?? ''} />
    </div>
  )
}
