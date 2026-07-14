import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ADMIN_PREFIX = '/admin'

const PROTECTED_USER_ROUTES = [
  '/profile',
  '/order-history',
  '/order-details',
]

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Protect /admin/* routes
  if (pathname.startsWith(PROTECTED_ADMIN_PREFIX)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // Protect specific user routes
  const isProtectedUserRoute = PROTECTED_USER_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedUserRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
