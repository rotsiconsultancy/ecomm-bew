import { getSetting } from '@/lib/settings'
import type { NotificationSettings } from '@/types/settings'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SMSResult {
  success: boolean
  stub?: boolean
  messageId?: string
  error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getSmsCfg() {
  const n = await getSetting<NotificationSettings>('notifications')
  return n?.sms ?? null
}

// ─── Public send function ─────────────────────────────────────────────────────

export async function sendSMS({ to, message }: { to: string; message: string }): Promise<SMSResult> {
  const cfg = await getSmsCfg()

  if (!cfg?.enabled) {
    return { success: false, error: 'SMS not enabled' }
  }

  // Stub mode — always active until Africa's Talking credentials are configured
  if (cfg.stub_mode || !cfg.api_key || !cfg.username) {
    console.log(`[SMS STUB] Would send SMS to ${to}: ${message}`)
    return { success: true, stub: true }
  }

  // ── Live Africa's Talking API ──────────────────────────────────────────────
  try {
    const params = new URLSearchParams({
      username: cfg.username,
      to,
      message,
      ...(cfg.sender_id ? { from: cfg.sender_id } : {}),
    })

    const res = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        apiKey: cfg.api_key,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const json = await res.json()

    if (!res.ok) {
      return { success: false, error: json?.SMSMessageData?.Message ?? 'Unknown error' }
    }

    const recipients = json?.SMSMessageData?.Recipients ?? []
    const first = recipients[0]
    return { success: true, messageId: first?.messageId }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
