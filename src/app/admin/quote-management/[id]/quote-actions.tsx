'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateQuoteStatus, convertQuoteToOrder } from '../actions'

const STATUSES = ['pending', 'reviewing', 'converted', 'rejected'] as const

interface Props {
  quoteId: string
  currentStatus: string
  adminNotes: string
}

export function QuoteActions({ quoteId, currentStatus, adminNotes }: Props) {
  const router = useRouter()
  const [status, setStatus]     = useState(currentStatus)
  const [notes, setNotes]       = useState(adminNotes)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await updateQuoteStatus(quoteId, status, notes)
      if (!result.success) { setError(result.error ?? 'Failed to save.'); return }
      setSuccess(true)
      router.refresh()
    })
  }

  function handleConvert() {
    if (!confirm('Convert this quote to an order? The quote will be marked as converted.')) return
    setError(null)
    startTransition(async () => {
      const result = await convertQuoteToOrder(quoteId)
      if (!result.success) { setError(result.error ?? 'Conversion failed.'); return }
      router.push(`/admin/order-management/${result.orderId}`)
    })
  }

  return (
    <Card className="p-6 rounded-2xl border-none shadow-sm space-y-5">
      <h2 className="font-bold text-[#061f3f] border-b pb-2">Admin Actions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Changes saved.</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes about this quote..."
          className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#061f3f] hover:bg-[#03152d] text-white font-bold"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={handleConvert}
          disabled={isPending || currentStatus === 'converted'}
          className="border-[#ff5f14] text-[#ff5f14] hover:bg-[#ff5f14] hover:text-white font-bold transition-all"
        >
          Convert to Order
        </Button>
      </div>
    </Card>
  )
}
