'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { adminGrantPoints as coreAdminGrant, getAdminLedger } from '@/lib/points'

// ─── Update a single config row ──────────────────────────────────────────────

export async function updatePointsConfigAction(
  id: string,
  pointsValue: number,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('points_config')
    .update({ points_value: pointsValue, is_active: isActive })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/points')
  return { success: true }
}

// ─── Add a new config row ────────────────────────────────────────────────────

export async function addPointsConfigAction(
  actionKey: string,
  label: string,
  pointsValue: number
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()

  const key = actionKey.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  if (!key) return { success: false, error: 'Invalid action key' }
  if (!label.trim()) return { success: false, error: 'Label is required' }

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('points_config')
    .insert({ action_key: key, label: label.trim(), points_value: pointsValue, is_active: true })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Action key already exists' }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/points')
  return { success: true }
}

// ─── Delete a config row ─────────────────────────────────────────────────────

export async function deletePointsConfigAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('points_config')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/points')
  return { success: true }
}

// ─── Admin grant points to a user ────────────────────────────────────────────

export async function adminGrantPointsAction(
  userId: string,
  points: number,
  note: string
): Promise<{ success: boolean; error?: string; balance?: number }> {
  await requireAdmin()
  if (points <= 0) return { success: false, error: 'Points must be positive' }
  if (!note.trim()) return { success: false, error: 'Note is required' }

  const result = await coreAdminGrant(userId, points, note)
  if (result.success) revalidatePath('/admin/points')
  return result
}

// ─── Fetch users for grant search ────────────────────────────────────────────

export async function searchUsersAction(
  query: string
): Promise<{ id: string; full_name: string | null; email: string }[]> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .or(`full_name.ilike.%${query}%`)
    .limit(10)

  return (data ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: '', // email stored in auth.users, not profiles
  }))
}

// ─── Fetch admin ledger with filters ─────────────────────────────────────────

export async function fetchAdminLedgerAction(filters?: {
  actionKey?: string
  dateFrom?: string
  dateTo?: string
}) {
  await requireAdmin()
  return getAdminLedger(filters)
}
