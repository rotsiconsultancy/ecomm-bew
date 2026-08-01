'use client'

import { Check, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export function FormSubmitButton({
  idleLabel,
  pendingLabel = 'Saving…',
  className = '',
  variant = 'default',
}: {
  idleLabel: string
  pendingLabel?: string
  className?: string
  variant?: 'default' | 'outline'
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      aria-busy={pending}
      className={`min-w-28 whitespace-nowrap font-black disabled:cursor-wait ${className}`}
    >
      {pending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Check aria-hidden="true" className="h-4 w-4" />}
      {pending ? pendingLabel : idleLabel}
    </Button>
  )
}
