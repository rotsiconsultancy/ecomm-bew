'use client'

import { useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteProduct } from './actions'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmation = window.prompt(
      `Permanently delete “${name}”? This cannot be undone. Type DELETE to continue.`,
    )
    if (confirmation !== 'DELETE') return

    startTransition(async () => {
      const result = await deleteProduct(id)
      if (!result.success) {
        window.alert(result.error ?? 'The product could not be deleted. It may be linked to an existing order.')
      } else if (result.warning) {
        window.alert(result.warning)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Permanently delete ${name}`}
      title={`Permanently delete ${name}`}
      className="grid h-11 w-11 place-items-center rounded-lg text-[#64748b] transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}
