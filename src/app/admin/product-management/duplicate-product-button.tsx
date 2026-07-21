'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CopyPlus, Loader2 } from 'lucide-react'
import { duplicateProduct } from './actions'

export default function DuplicateProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateProduct(id)
      if (!result.success || !result.id) {
        window.alert(result.error || 'Could not duplicate this product.')
        return
      }

      router.push(`/admin/product-management/${result.id}/edit`)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isPending}
      aria-label={`Duplicate ${name}`}
      title={`Duplicate ${name}`}
      className="grid h-11 w-11 place-items-center rounded-lg text-[#64748b] transition-colors hover:bg-[#fff3ec] hover:text-[#c94306] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14] disabled:cursor-wait disabled:opacity-60"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CopyPlus className="h-4 w-4" />}
    </button>
  )
}
