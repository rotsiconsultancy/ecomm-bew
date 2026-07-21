'use client'

import { useTransition } from 'react'
import { toggleProductStatus } from './actions'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function ToggleStatusButton({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await toggleProductStatus(id, !isActive)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isActive ? 'Hide product from store' : 'Show product in store'}
      title={isActive ? 'Hide product from store' : 'Show product in store'}
      className={`grid h-11 w-11 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5f14] disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive
          ? 'text-emerald-700 hover:bg-slate-100 hover:text-slate-600'
          : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )
}
