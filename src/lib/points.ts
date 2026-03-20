import { createClient, createServiceClient } from '@/lib/supabase/server'
import type {
  PointsConfig,
  PointsLedger,
  PointsClaim,
  ClaimResult,
  RedeemResult,
  LedgerEntry,
  EarnAction,
  EarnStatus,
} from '@/types/points'
import { POINTS_TO_KES } from '@/types/points'

// ─── Read helpers (anon client — RLS scoped to user) ─────────────────────────

export async function getPointsConfig(): Promise<PointsConfig[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('points_config')
    .select('*')
    .eq('is_active', true)
    .order('created_at')
  return (data ?? []) as PointsConfig[]
}

export async function getAllPointsConfig(): Promise<PointsConfig[]> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('points_config')
    .select('*')
    .order('created_at')
  return (data ?? []) as PointsConfig[]
}

export async function getUserPointsBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('points_ledger')
    .select('points')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
  if (!data) return 0
  return data.reduce((sum, row) => sum + row.points, 0)
}

export async function getUserLedger(userId: string): Promise<LedgerEntry[]> {
  const supabase = await createClient()

  const [ledgerRes, configRes] = await Promise.all([
    supabase
      .from('points_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('points_config').select('action_key, label'),
  ])

  const config = (configRes.data ?? []) as Pick<PointsConfig, 'action_key' | 'label'>[]
  const labelMap = Object.fromEntries(config.map((c) => [c.action_key, c.label]))

  return ((ledgerRes.data ?? []) as PointsLedger[]).map((row) => ({
    ...row,
    label: labelMap[row.action_key] ?? row.action_key,
  }))
}

export async function getPendingRedemption(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('points_ledger')
    .select('points')
    .eq('user_id', userId)
    .eq('status', 'pending')
  if (!data || data.length === 0) return 0
  // pending redemptions are negative, return absolute value
  return Math.abs(data.reduce((sum, row) => sum + row.points, 0))
}

export async function getUserClaims(userId: string): Promise<PointsClaim[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('points_claims')
    .select('*')
    .eq('user_id', userId)
  return (data ?? []) as PointsClaim[]
}

// ─── Claim check ─────────────────────────────────────────────────────────────

export async function hasAlreadyClaimed(
  userId: string,
  actionKey: string,
  referenceId?: string
): Promise<boolean> {
  const supabase = await createClient()
  let query = supabase
    .from('points_claims')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_key', actionKey)

  if (referenceId) {
    query = query.eq('reference_id', referenceId)
  } else {
    query = query.is('reference_id', null)
  }

  const { count } = await query
  return (count ?? 0) > 0
}

// ─── Core claim function ─────────────────────────────────────────────────────

export async function claimPoints(
  userId: string,
  actionKey: string,
  referenceId?: string
): Promise<ClaimResult> {
  // 1. Check for double-claim
  const claimed = await hasAlreadyClaimed(userId, actionKey, referenceId)
  if (claimed) return { success: false, error: 'Already claimed' }

  const supabase = await createServiceClient()

  // 2. Fetch config for this action
  const { data: config } = await supabase
    .from('points_config')
    .select('*')
    .eq('action_key', actionKey)
    .eq('is_active', true)
    .maybeSingle()

  if (!config) return { success: false, error: 'Action not found or inactive' }

  let pointsToAward = (config as PointsConfig).points_value
  let note: string | null = null
  let orderId: string | null = null

  // 3. Special handling per action
  if (actionKey === 'purchase') {
    if (!referenceId) return { success: false, error: 'Order ID required for purchase claims' }
    orderId = referenceId
    const { data: order } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('id', referenceId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!order) return { success: false, error: 'Order not found' }
    if (order.status !== 'delivered') return { success: false, error: 'Order must be delivered first' }

    pointsToAward = Math.floor(order.total_amount / 50) * (config as PointsConfig).points_value
    note = `Order total: KES ${Number(order.total_amount).toLocaleString()}`
  }

  if (actionKey === 'first_order') {
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if (!count || count === 0) return { success: false, error: 'No orders yet' }
  }

  if (actionKey === 'daily_login') {
    // reference_id = today's date string YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10)
    if (referenceId !== today) return { success: false, error: 'Invalid date for daily login' }
  }

  if (actionKey === 'login_streak_7') {
    // Check that user has claimed daily_login for the last 7 consecutive days
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const { count } = await supabase
        .from('points_claims')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_key', 'daily_login')
        .eq('reference_id', dateStr)
      if (!count || count === 0) {
        return { success: false, error: `Missing daily login for ${dateStr}` }
      }
    }
    note = '7-day streak completed'
  }

  if (pointsToAward <= 0 && actionKey !== 'admin_grant') {
    return { success: false, error: 'No points to award' }
  }

  // 4. Insert ledger entry
  const { error: ledgerErr } = await supabase.from('points_ledger').insert({
    user_id: userId,
    action_key: actionKey,
    order_id: orderId,
    points: pointsToAward,
    note,
    status: 'confirmed',
  })
  if (ledgerErr) return { success: false, error: ledgerErr.message }

  // 5. Insert claim record
  const { error: claimErr } = await supabase.from('points_claims').insert({
    user_id: userId,
    action_key: actionKey,
    reference_id: referenceId ?? null,
  })
  if (claimErr) return { success: false, error: claimErr.message }

  // 6. Return updated balance
  const balance = await getUserPointsBalance(userId)
  return { success: true, balance, points_awarded: pointsToAward }
}

// ─── Admin grant (bypasses claim check) ──────────────────────────────────────

export async function adminGrantPoints(
  userId: string,
  points: number,
  note: string
): Promise<ClaimResult> {
  const supabase = await createServiceClient()

  const { error } = await supabase.from('points_ledger').insert({
    user_id: userId,
    action_key: 'admin_grant',
    points,
    note,
    status: 'confirmed',
  })

  if (error) return { success: false, error: error.message }

  const balance = await getUserPointsBalance(userId)
  return { success: true, balance, points_awarded: points }
}

// ─── Redeem points (creates pending negative ledger row) ─────────────────────

export async function redeemPoints(
  userId: string,
  pointsToRedeem: number
): Promise<RedeemResult> {
  if (pointsToRedeem <= 0) return { success: false, error: 'Must redeem at least 1 point' }

  const balance = await getUserPointsBalance(userId)
  const pendingAlready = await getPendingRedemption(userId)
  const available = balance - pendingAlready

  if (available < pointsToRedeem) {
    return { success: false, error: `Insufficient balance. Available: ${available} pts` }
  }

  const supabase = await createServiceClient()
  const kesDiscount = pointsToRedeem * POINTS_TO_KES

  const { error } = await supabase.from('points_ledger').insert({
    user_id: userId,
    action_key: 'redemption',
    points: -pointsToRedeem,
    note: `Redeem ${pointsToRedeem} pts for KES ${kesDiscount.toFixed(2)} discount`,
    status: 'pending',
  })

  if (error) return { success: false, error: error.message }

  const newBalance = await getUserPointsBalance(userId)
  return { success: true, balance: newBalance, kes_discount: kesDiscount }
}

// ─── Finalise pending redemption (called on order confirmation) ──────────────

export async function finaliseRedemption(
  userId: string,
  orderId: string
): Promise<void> {
  const supabase = await createServiceClient()
  await supabase
    .from('points_ledger')
    .update({ status: 'confirmed', order_id: orderId })
    .eq('user_id', userId)
    .eq('status', 'pending')
}

// ─── Cancel pending redemption ───────────────────────────────────────────────

export async function cancelPendingRedemption(userId: string): Promise<void> {
  const supabase = await createServiceClient()
  await supabase
    .from('points_ledger')
    .delete()
    .eq('user_id', userId)
    .eq('status', 'pending')
}

// ─── Build earn actions list for Points Hub ──────────────────────────────────

export async function getEarnActions(userId: string): Promise<EarnAction[]> {
  const supabase = await createClient()

  const [configRes, claimsRes, ordersRes] = await Promise.all([
    supabase.from('points_config').select('*').eq('is_active', true).order('created_at'),
    supabase.from('points_claims').select('*').eq('user_id', userId),
    supabase
      .from('orders')
      .select('id, total_amount, status')
      .eq('user_id', userId)
      .eq('status', 'delivered'),
  ])

  const configs = (configRes.data ?? []) as PointsConfig[]
  const claims = (claimsRes.data ?? []) as PointsClaim[]
  const deliveredOrders = ordersRes.data ?? []

  // Build a set of claimed (action_key + reference_id) for quick lookup
  const claimedSet = new Set(
    claims.map((c) => `${c.action_key}::${c.reference_id ?? ''}`)
  )
  const hasClaim = (key: string, ref?: string) => claimedSet.has(`${key}::${ref ?? ''}`)

  const today = new Date().toISOString().slice(0, 10)
  const actions: EarnAction[] = []

  for (const cfg of configs) {
    // Skip admin_grant — not user-claimable
    if (cfg.action_key === 'admin_grant') continue

    if (cfg.action_key === 'purchase') {
      // Show one row per unclaimed delivered order
      for (const order of deliveredOrders) {
        const ref = order.id as string
        if (hasClaim('purchase', ref)) {
          actions.push({
            action_key: 'purchase',
            label: cfg.label,
            points_value: Math.floor(Number(order.total_amount) / 50) * cfg.points_value,
            status: 'claimed',
            reference_id: ref,
            description: `Order — KES ${Number(order.total_amount).toLocaleString()}`,
          })
        } else {
          actions.push({
            action_key: 'purchase',
            label: cfg.label,
            points_value: Math.floor(Number(order.total_amount) / 50) * cfg.points_value,
            status: 'available',
            reference_id: ref,
            description: `Order — KES ${Number(order.total_amount).toLocaleString()}`,
          })
        }
      }
      // If no delivered orders at all, show locked row
      if (deliveredOrders.length === 0) {
        actions.push({
          action_key: 'purchase',
          label: cfg.label,
          points_value: cfg.points_value,
          status: 'locked',
          description: 'Complete & receive an order first',
        })
      }
      continue
    }

    if (cfg.action_key === 'daily_login') {
      const status: EarnStatus = hasClaim('daily_login', today) ? 'claimed' : 'available'
      actions.push({
        action_key: 'daily_login',
        label: cfg.label,
        points_value: cfg.points_value,
        status,
        reference_id: today,
      })
      continue
    }

    if (cfg.action_key === 'login_streak_7') {
      // Check if already claimed today's streak
      const streakRef = `streak_${today}`
      if (hasClaim('login_streak_7', streakRef)) {
        actions.push({
          action_key: 'login_streak_7',
          label: cfg.label,
          points_value: cfg.points_value,
          status: 'claimed',
          reference_id: streakRef,
        })
        continue
      }
      // Check if user has 7 consecutive daily_login claims
      let streakOk = true
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().slice(0, 10)
        if (!hasClaim('daily_login', dateStr)) {
          streakOk = false
          break
        }
      }
      actions.push({
        action_key: 'login_streak_7',
        label: cfg.label,
        points_value: cfg.points_value,
        status: streakOk ? 'available' : 'locked',
        reference_id: streakRef,
        description: streakOk ? '7-day streak complete!' : 'Claim Daily Login for 7 consecutive days',
      })
      continue
    }

    if (cfg.action_key === 'first_order') {
      if (hasClaim('first_order')) {
        actions.push({ action_key: 'first_order', label: cfg.label, points_value: cfg.points_value, status: 'claimed' })
      } else if (deliveredOrders.length > 0 || (ordersRes.data ?? []).length > 0) {
        // Has at least one order (any status) — eligible
        const { count } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
        actions.push({
          action_key: 'first_order',
          label: cfg.label,
          points_value: cfg.points_value,
          status: (count ?? 0) > 0 ? 'available' : 'locked',
          description: (count ?? 0) > 0 ? undefined : 'Place your first order',
        })
      } else {
        actions.push({
          action_key: 'first_order',
          label: cfg.label,
          points_value: cfg.points_value,
          status: 'locked',
          description: 'Place your first order',
        })
      }
      continue
    }

    if (cfg.action_key === 'signup') {
      actions.push({
        action_key: 'signup',
        label: cfg.label,
        points_value: cfg.points_value,
        status: hasClaim('signup') ? 'claimed' : 'available',
      })
      continue
    }

    // Generic actions (review_text, review_photo, social_tag, referral)
    // These are user-initiated — show as claimed if done, otherwise available
    if (hasClaim(cfg.action_key)) {
      actions.push({ action_key: cfg.action_key, label: cfg.label, points_value: cfg.points_value, status: 'claimed' })
    } else {
      actions.push({ action_key: cfg.action_key, label: cfg.label, points_value: cfg.points_value, status: 'available' })
    }
  }

  return actions
}

// ─── Admin: full ledger across all users ─────────────────────────────────────

export async function getAdminLedger(filters?: {
  actionKey?: string
  dateFrom?: string
  dateTo?: string
}): Promise<(PointsLedger & { user_name: string; user_email: string })[]> {
  const supabase = await createServiceClient()

  let query = supabase
    .from('points_ledger')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (filters?.actionKey) {
    query = query.eq('action_key', filters.actionKey)
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59`)
  }

  const { data: ledger } = await query
  if (!ledger || ledger.length === 0) return []

  // Fetch user names for the ledger entries
  const userIds = [...new Set((ledger as PointsLedger[]).map((r) => r.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? 'Unknown'])
  )

  // Also get emails from auth (service client has access)
  // We'll use full_name from profiles; email is not in profiles table
  return (ledger as PointsLedger[]).map((row) => ({
    ...row,
    user_name: profileMap[row.user_id] ?? 'Unknown',
    user_email: '', // email not easily available without admin API
  }))
}
