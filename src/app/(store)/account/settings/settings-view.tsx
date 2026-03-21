'use client'

import { useState, useTransition } from 'react'
import { Loader2, Check } from 'lucide-react'
import { toggleInfluenceAction } from '@/app/(store)/checkout/actions'

interface Props {
  influenceEnabled: boolean | null
  toggleLabel: string
}

export function SettingsView({ influenceEnabled, toggleLabel }: Props) {
  const [isPending, startTransition] = useTransition()
  const [enabled, setEnabled] = useState(influenceEnabled ?? true)
  const [saved, setSaved] = useState(false)

  function handleToggle() {
    const next = !enabled
    setEnabled(next)
    setSaved(false)
    startTransition(async () => {
      await toggleInfluenceAction(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="space-y-8">
      {/* Shopping preferences */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-[#003366]">Shopping Preferences</h2>

        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`shrink-0 w-11 h-6 rounded-full transition-colors relative overflow-hidden mt-0.5 ${
              enabled ? 'bg-[#ec5b13]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="space-y-1">
            <p className="font-bold text-sm text-[#003366]">{toggleLabel}</p>
            <p className="text-xs text-gray-400">
              You can change this at any time.
            </p>
          </div>
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />}
          {saved && <Check className="w-4 h-4 text-green-500 shrink-0" />}
        </div>
      </div>
    </div>
  )
}
