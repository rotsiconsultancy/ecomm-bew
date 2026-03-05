'use client'

import { useTransition } from 'react'
import { toggleProductStatus } from './actions'
import { Eye, EyeOff } from 'lucide-react'

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
      title={isActive ? 'Deactivate product' : 'Activate product'}
      className={`p-2 transition-colors disabled:opacity-40 ${
        isActive
          ? 'text-green-500 hover:text-gray-400'
          : 'text-gray-300 hover:text-green-500'
      }`}
    >
      {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  )
}
