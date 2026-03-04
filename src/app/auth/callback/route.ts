import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Supabase forwards its own error params when something goes wrong
  // (e.g. expired email confirmation link, denied OAuth, etc.)
  const supabaseError = searchParams.get('error')
  const supabaseErrorCode = searchParams.get('error_code')

  if (supabaseError) {
    // Map known Supabase error codes to specific UI error types
    const errorParam =
      supabaseErrorCode === 'otp_expired' ? 'link_expired' : 'auth'
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Create profile row on first login if it doesn't exist
  const serviceClient = await createServiceClient()
  const { data: existingProfile } = await serviceClient
    .from('profiles')
    .select('id, role')
    .eq('id', data.user.id)
    .maybeSingle()

  let profile = existingProfile

  if (!existingProfile) {
    const fullName =
      data.user.user_metadata?.full_name ??
      data.user.user_metadata?.name ??
      null

    const { data: newProfile } = await serviceClient
      .from('profiles')
      .insert({ id: data.user.id, full_name: fullName, role: 'customer' })
      .select('id, role')
      .maybeSingle()

    profile = newProfile
  }

  // Admins and staff always land on the admin dashboard when next is '/'
  const isAdmin =
    profile?.role === 'admin' || profile?.role === 'staff'
  const destination = isAdmin && next === '/' ? '/admin/dashboard' : next

  const redirectTo = destination.startsWith('/') ? `${origin}${destination}` : origin
  return NextResponse.redirect(redirectTo)
}
