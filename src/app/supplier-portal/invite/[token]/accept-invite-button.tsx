'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { acceptSupplierInvite } from '../../actions'

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function accept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptSupplierInvite(token)
      if (result.success) {
        router.push('/supplier-portal')
        router.refresh()
      } else {
        setError(result.error ?? 'Failed to accept invite.')
      }
    })
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
      <Button onClick={accept} disabled={isPending} className="h-12 w-full rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
        {isPending ? 'Accepting...' : 'Accept supplier invite'}
      </Button>
    </div>
  )
}
