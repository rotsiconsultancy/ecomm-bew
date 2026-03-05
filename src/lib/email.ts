import { Resend } from 'resend'
import type { ReactElement } from 'react'
import { getSetting } from '@/lib/settings'
import type { NotificationSettings } from '@/types/settings'

// ─── Resend initialiser ───────────────────────────────────────────────────────

let _resend: Resend | null = null

async function initResend(): Promise<{ client: Resend; from: string } | null> {
  const n = await getSetting<NotificationSettings>('notifications')
  const cfg = n?.email
  if (!cfg?.enabled || !cfg.api_key) return null

  if (!_resend) _resend = new Resend(cfg.api_key)
  return {
    client: _resend,
    from: cfg.from_address || 'noreply@bewama.com',
  }
}

// ─── Public send helper ───────────────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[]
  subject: string
  react: ReactElement
}): Promise<{ success: boolean; error?: string }> {
  try {
    const r = await initResend()
    if (!r) return { success: false, error: 'Email not configured' }

    const { error } = await r.client.emails.send({
      from: r.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
