import { createServiceClient } from '@/lib/supabase/server'
import { createBuildClient } from '@/lib/supabase/server'
import {
  AllSettings,
  SiteSettings,
  PaymentSettings,
  LogisticsSettings,
  NotificationSettings,
  DEFAULT_SITE,
  DEFAULT_PAYMENTS,
  DEFAULT_LOGISTICS,
  DEFAULT_NOTIFICATIONS,
} from '@/types/settings'

// ─── Generic helpers ──────────────────────────────────────────────────────────

export async function getSetting<T>(key: string): Promise<T | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return (data?.value as T) ?? null
}

export async function upsertSetting(key: string, value: unknown): Promise<void> {
  const supabase = await createServiceClient()
  await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}

// ─── Typed bulk fetch ─────────────────────────────────────────────────────────

export async function getAllSettings(): Promise<AllSettings> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['site', 'payments', 'logistics', 'notifications'])

  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))

  return {
    site:          { ...DEFAULT_SITE,          ...(map['site']          as Partial<SiteSettings>         ?? {}) },
    payments:      mergePayments(map['payments']),
    logistics:     mergeLogistics(map['logistics']),
    notifications: mergeNotifications(map['notifications']),
  }
}

function mergePayments(stored: unknown): PaymentSettings {
  const s = (stored ?? {}) as Partial<PaymentSettings>
  return {
    rotsi:  { ...DEFAULT_PAYMENTS.rotsi,  ...(s.rotsi  ?? {}) },
    paypal: { ...DEFAULT_PAYMENTS.paypal, ...(s.paypal ?? {}) },
    cards:  { ...DEFAULT_PAYMENTS.cards,  ...(s.cards  ?? {}) },
    cod:    { ...DEFAULT_PAYMENTS.cod,    ...(s.cod    ?? {}) },
  }
}

function mergeLogistics(stored: unknown): LogisticsSettings {
  const s = (stored ?? {}) as Partial<LogisticsSettings>
  return {
    pickup_mtaani:  { ...DEFAULT_LOGISTICS.pickup_mtaani,  ...(s.pickup_mtaani  ?? {}) },
    self_pickup:    { ...DEFAULT_LOGISTICS.self_pickup,    ...(s.self_pickup    ?? {}) },
    truck_delivery: { ...DEFAULT_LOGISTICS.truck_delivery, ...(s.truck_delivery ?? {}) },
  }
}

function mergeNotifications(stored: unknown): NotificationSettings {
  const s = (stored ?? {}) as Partial<NotificationSettings>
  return {
    ...DEFAULT_NOTIFICATIONS,
    ...s,
    email: { ...DEFAULT_NOTIFICATIONS.email, ...(s.email ?? {}) },
    sms:   { ...DEFAULT_NOTIFICATIONS.sms,   ...(s.sms   ?? {}) },
    notify_emails: s.notify_emails ?? DEFAULT_NOTIFICATIONS.notify_emails,
    notify_phones: s.notify_phones ?? DEFAULT_NOTIFICATIONS.notify_phones,
  }
}

// ─── Public (anon) — safe for footer/header ───────────────────────────────────

export async function getPublicSiteSettings(): Promise<SiteSettings> {
  const supabase = createBuildClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site')
    .maybeSingle()
  return { ...DEFAULT_SITE, ...((data?.value as Partial<SiteSettings>) ?? {}) }
}
