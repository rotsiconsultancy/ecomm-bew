'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={cn('disabled:opacity-50', className)}
    >
      <LogOut className="h-5 w-5" />
      <span>{loading ? 'Signing out…' : 'Log Out'}</span>
    </button>
  )
}
