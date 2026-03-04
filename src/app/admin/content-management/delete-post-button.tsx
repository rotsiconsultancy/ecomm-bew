'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deletePost } from './actions'

export default function DeletePostButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    startTransition(async () => { await deletePost(id) })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
