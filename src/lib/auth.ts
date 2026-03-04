import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return profile
}

export async function requireAdmin() {
  const profile = await getUserProfile()

  if (!profile || !['admin', 'staff'].includes(profile.role)) {
    redirect('/login')
  }

  return profile
}

/**
 * Use in admin layouts/pages.
 * Returns both the Supabase user and their DB profile in a single function.
 * Redirects to /login if unauthenticated or not admin/staff.
 */
export async function getAdminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['admin', 'staff'].includes(profile.role)) {
    redirect('/login')
  }

  return {
    user: { id: user.id, email: user.email ?? '' },
    profile: profile as { id: string; full_name: string | null; role: string },
  }
}
