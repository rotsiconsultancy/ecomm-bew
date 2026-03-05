'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from './actions'

export default function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Deactivate this product? It will be hidden from the store (soft delete).')) return
    startTransition(async () => { await deleteProduct(id) })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Deactivate product"
      className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
