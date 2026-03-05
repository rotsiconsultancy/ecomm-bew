'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Plain service-role client for auth.admin.* methods (no cookie handling needed)
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export type UserRole = 'admin' | 'staff' | 'wholesale' | 'customer'

export interface CombinedUser {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  last_sign_in_at: string | null
  is_banned: boolean
}

// ─── GET ALL USERS ──────────────────────────────────────────────────────────

export async function getUsers(): Promise<CombinedUser[]> {
  await getAdminContext()

  const admin   = createAdminClient()
  const supabase = await createServiceClient()

  // Paginate through all auth users (max 1000 per page)
  const authUserList: Array<{
    id: string
    email?: string
    last_sign_in_at?: string
    created_at: string
    banned_until?: string | null
  }> = []

  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users?.length) break
    authUserList.push(...data.users)
    if (data.users.length < perPage) break
    page++
  }

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, created_at')

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return authUserList.map((authUser) => {
    const profile   = profileMap.get(authUser.id)
    const isBanned  =
      !!authUser.banned_until && new Date(authUser.banned_until) > new Date()

    return {
      id:               authUser.id,
      email:            authUser.email ?? '',
      full_name:        profile?.full_name ?? null,
      phone:            profile?.phone ?? null,
      role:             (profile?.role ?? 'customer') as UserRole,
      created_at:       profile?.created_at ?? authUser.created_at,
      last_sign_in_at:  authUser.last_sign_in_at ?? null,
      is_banned:        isBanned,
    }
  })
}

// ─── GET SINGLE USER ────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<CombinedUser | null> {
  await getAdminContext()

  const admin   = createAdminClient()
  const supabase = await createServiceClient()

  const { data: authData, error } = await admin.auth.admin.getUserById(userId)
  if (error || !authData?.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, created_at')
    .eq('id', userId)
    .maybeSingle()

  const authUser = authData.user
  const isBanned =
    !!(authUser as any).banned_until &&
    new Date((authUser as any).banned_until) > new Date()

  return {
    id:              authUser.id,
    email:           authUser.email ?? '',
    full_name:       profile?.full_name ?? null,
    phone:           profile?.phone ?? null,
    role:            (profile?.role ?? 'customer') as UserRole,
    created_at:      profile?.created_at ?? authUser.created_at,
    last_sign_in_at: authUser.last_sign_in_at ?? null,
    is_banned:       isBanned,
  }
}

// ─── UPDATE ROLE (admin + staff) ────────────────────────────────────────────

export async function updateUserRole(userId: string, role: UserRole) {
  await getAdminContext() // staff can also update roles

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/user-management')
  return { success: true }
}

// ─── BAN (admin only) ───────────────────────────────────────────────────────

export async function banUser(userId: string) {
  const { profile } = await getAdminContext()
  if (profile.role !== 'admin') return { success: false, error: 'Only admins can ban users.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876600h', // ~100 years
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/user-management')
  return { success: true }
}

// ─── UNBAN (admin only) ─────────────────────────────────────────────────────

export async function unbanUser(userId: string) {
  const { profile } = await getAdminContext()
  if (profile.role !== 'admin') return { success: false, error: 'Only admins can unban users.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/user-management')
  return { success: true }
}

// ─── DELETE (admin only) ────────────────────────────────────────────────────

export async function deleteUser(userId: string) {
  const { profile, user } = await getAdminContext()
  if (profile.role !== 'admin') return { success: false, error: 'Only admins can delete users.' }
  if (user.id === userId) return { success: false, error: 'You cannot delete your own account.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/user-management')
  return { success: true }
}

// ─── UPDATE PROFILE (admin only) ────────────────────────────────────────────

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string; phone?: string; role?: UserRole }
) {
  await getAdminContext()

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/user-management/${userId}`)
  revalidatePath('/admin/user-management')
  return { success: true }
}
