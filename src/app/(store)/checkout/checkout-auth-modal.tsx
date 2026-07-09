'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export function CheckoutAuthModal() {
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
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/checkout`,
      },
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
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fff1e8] text-[#ff5f14]">
        <LockKeyhole className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-3xl font-black text-[#061f3f] sm:text-4xl">Sign in to finish checkout</h1>
      <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#4b5a6a]">
        Your cart is ready. Sign in here to continue with saved delivery details, invoices, and order history.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="h-12 rounded-lg bg-[#ff5f14] px-5 font-black text-white hover:bg-[#e84f0a]"
        >
          <UserRound className="h-5 w-5" />
          Sign in to checkout
        </Button>
        <Button
          asChild
          type="button"
          variant="outline"
          className="h-12 rounded-lg border-[#d8e0ea] px-5 font-black text-[#061f3f] hover:bg-[#f4f7fa]"
        >
          <Link href="/products">
            Keep browsing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border-[#d8e0ea] p-5 shadow-2xl sm:max-w-md sm:p-7">
          <DialogHeader>
            <div className="mb-1 grid h-11 w-11 place-items-center rounded-full bg-[#fff1e8] text-[#ff5f14]">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#061f3f]">
              Continue checkout
            </DialogTitle>
            <DialogDescription className="font-semibold leading-6 text-[#4b5a6a]">
              Sign in without leaving checkout.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="flex h-12 w-full items-center gap-3 rounded-lg border-[#d8e0ea] bg-white font-black text-[#061f3f] hover:bg-[#f4f7fa]"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#edf1f5]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-black tracking-wider text-[#728196]">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="checkout-auth-email" className="mb-1.5 block text-sm font-black text-[#061f3f]">
                Email address
              </label>
              <Input
                id="checkout-auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg border-[#d8e0ea] bg-[#f4f7fa] font-bold focus:border-[#ff5f14] focus:ring-[#ff5f14]"
              />
            </div>

            <div>
              <label htmlFor="checkout-auth-password" className="mb-1.5 block text-sm font-black text-[#061f3f]">
                Password
              </label>
              <div className="relative">
                <Input
                  id="checkout-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg border-[#d8e0ea] bg-[#f4f7fa] pr-10 font-bold focus:border-[#ff5f14] focus:ring-[#ff5f14]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#728196] hover:text-[#061f3f]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]"
            >
              {loading ? 'Signing in...' : 'Sign in and continue'}
            </Button>
          </form>

          <p className="text-center text-sm font-semibold text-[#4b5a6a]">
            No account?{' '}
            <Link href="/register" className="font-black text-[#ff5f14] hover:text-[#e84f0a]">
              Create one
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
