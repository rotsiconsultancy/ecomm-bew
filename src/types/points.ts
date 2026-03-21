// ─── Bewama Points System Types ──────────────────────────────────────────────

export interface PointsConfig {
  id: string
  action_key: string
  label: string
  points_value: number
  is_active: boolean
  created_at: string
}

export interface PointsLedger {
  id: string
  user_id: string
  action_key: string
  order_id: string | null
  points: number
  note: string | null
  status: 'confirmed' | 'pending'
  claimed_at: string
  created_at: string
}

export interface PointsClaim {
  id: string
  user_id: string
  action_key: string
  reference_id: string | null
  claimed_at: string
}

export interface ClaimResult {
  success: boolean
  balance?: number
  points_awarded?: number
  error?: string
}

export interface RedeemResult {
  success: boolean
  balance?: number
  kes_discount?: number
  error?: string
}

/** Enriched ledger row with action label for display */
export interface LedgerEntry extends PointsLedger {
  label: string
}

/** Earn action status for the Points Hub checklist */
export type EarnStatus = 'claimed' | 'available' | 'locked'

export interface EarnAction {
  action_key: string
  label: string
  points_value: number
  status: EarnStatus
  reference_id?: string           // e.g. order_id for purchase claims
  description?: string            // e.g. "Order #ABC — KES 5,000"
}

/** Points conversion rate: 1 point = KES 0.10 */
export const POINTS_TO_KES = 0.10
