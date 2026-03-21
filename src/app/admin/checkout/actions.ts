'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import type { InfluenceIntensity } from '@/types/checkout'

// ─── Influence config ────────────────────────────────────────────────────────

export async function saveCheckoutConfigAction(data: {
  influence_default_retail: boolean
  influence_default_wholesale: boolean
  influence_intensity: InfluenceIntensity
  show_companions: boolean
  show_scarcity: boolean
  show_social_proof: boolean
  show_points_overlay: boolean
  show_streak_reminder: boolean
  show_bundle_framing: boolean
  influence_toggle_label: string
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('checkout_config')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/checkout')
  return { success: true }
}

// ─── Payment methods ─────────────────────────────────────────────────────────

export async function savePaymentMethodAction(
  id: string,
  data: {
    label: string
    is_active: boolean
    sort_order: number
    min_order_amount: number
    allowed_tiers: string[]
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('payment_methods')
    .update(data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/checkout')
  return { success: true }
}

// ─── Post-purchase prompts ───────────────────────────────────────────────────

export async function savePostPurchasePromptAction(
  id: string,
  data: {
    copy_text: string
    points_value: number
    is_active: boolean
    trigger_timing: string
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('post_purchase_config')
    .update(data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/checkout')
  return { success: true }
}

// ─── Companion rules ─────────────────────────────────────────────────────────

export async function saveCompanionRuleAction(
  id: string,
  data: {
    source_category: string
    target_category: string
    reason_copy: string
    points_multiplier: number
    display_limit: number
    is_active: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('companion_rules')
    .update(data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/checkout')
  return { success: true }
}

export async function addCompanionRuleAction(data: {
  source_category: string
  target_category: string
  reason_copy: string
  points_multiplier: number
  display_limit: number
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('companion_rules')
    .insert({ ...data, is_active: true })

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/checkout')
  return { success: true }
}

export async function deleteCompanionRuleAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('companion_rules')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/checkout')
  return { success: true }
}
