'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export function SupplierAuthModal({ next = '/become-supplier' }: { next?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="mx-auto flex min-h-[62vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fff1e8] text-[#ff5f14]">
        <LockKeyhole className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-3xl font-black text-[#061f3f]">Sign in to apply as a supplier</h1>
      <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#4b5a6a]">
        Supplier applications are tied to a Bewama account so approval, setup, and portal access stay secure.
      </p>
      <Button onClick={() => setOpen(true)} className="mt-7 h-12 rounded-lg bg-[#ff5f14] px-6 font-black text-white hover:bg-[#e84f0a]">
        Sign in to continue
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl border-[#d8e0ea] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#061f3f]">Supplier application</DialogTitle>
            <DialogDescription>Sign in without leaving this page.</DialogDescription>
          </DialogHeader>
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          <Button type="button" variant="outline" className="h-12 font-black" onClick={handleGoogleLogin} disabled={loading}>
            Continue with Google
          </Button>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input type="email" autoComplete="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pr-10" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="text-center text-sm font-semibold text-[#4b5a6a]">
            No account? <Link href="/register" className="font-black text-[#ff5f14]">Create one</Link>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
