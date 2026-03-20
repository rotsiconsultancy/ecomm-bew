'use server'

import { getUser } from '@/lib/auth'
import {
  claimPoints as coreClaimPoints,
  redeemPoints as coreRedeemPoints,
  cancelPendingRedemption as coreCancelPending,
} from '@/lib/points'
import type { ClaimResult, RedeemResult } from '@/types/points'

export async function claimPointsAction(
  actionKey: string,
  referenceId?: string
): Promise<ClaimResult> {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  return coreClaimPoints(user.id, actionKey, referenceId)
}

export async function redeemPointsAction(
  pointsToRedeem: number
): Promise<RedeemResult> {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  return coreRedeemPoints(user.id, pointsToRedeem)
}

export async function cancelRedemptionAction(): Promise<{ success: boolean }> {
  const user = await getUser()
  if (!user) return { success: false }
  await coreCancelPending(user.id)
  return { success: true }
}
