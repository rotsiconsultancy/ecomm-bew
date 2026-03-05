'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { upsertSetting } from '@/lib/settings'
import type {
  SiteSettings,
  PaymentSettings,
  LogisticsSettings,
  NotificationSettings,
} from '@/types/settings'

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function saveSiteSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  try {
    const value: SiteSettings = {
      name:             String(formData.get('name') ?? ''),
      tagline:          String(formData.get('tagline') ?? ''),
      logo_url:         String(formData.get('logo_url') ?? ''),
      favicon_url:      String(formData.get('favicon_url') ?? ''),
      contact_email:    String(formData.get('contact_email') ?? ''),
      contact_phone:    String(formData.get('contact_phone') ?? ''),
      address:          String(formData.get('address') ?? ''),
      business_hours:   String(formData.get('business_hours') ?? ''),
      default_currency: (formData.get('default_currency') as SiteSettings['default_currency']) ?? 'KES',
      social_links: {
        facebook:  String(formData.get('social_facebook') ?? '') || undefined,
        instagram: String(formData.get('social_instagram') ?? '') || undefined,
        twitter:   String(formData.get('social_twitter') ?? '') || undefined,
        linkedin:  String(formData.get('social_linkedin') ?? '') || undefined,
        whatsapp:  String(formData.get('social_whatsapp') ?? '') || undefined,
      },
    }
    await upsertSetting('site', value)
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// ─── Payment Settings ─────────────────────────────────────────────────────────

export async function savePaymentSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  try {
    const value: PaymentSettings = {
      rotsi: {
        enabled:         formData.get('rotsi_enabled') === 'on',
        consumer_key:    String(formData.get('rotsi_consumer_key') ?? ''),
        consumer_secret: String(formData.get('rotsi_consumer_secret') ?? ''),
        shortcode:       String(formData.get('rotsi_shortcode') ?? ''),
        passkey:         String(formData.get('rotsi_passkey') ?? ''),
        environment:     (formData.get('rotsi_environment') as 'sandbox' | 'production') ?? 'sandbox',
      },
      paypal: {
        enabled:       formData.get('paypal_enabled') === 'on',
        client_id:     String(formData.get('paypal_client_id') ?? ''),
        client_secret: String(formData.get('paypal_client_secret') ?? ''),
        environment:   (formData.get('paypal_environment') as 'sandbox' | 'production') ?? 'sandbox',
      },
      cards: {
        enabled:     formData.get('cards_enabled') === 'on',
        provider:    String(formData.get('cards_provider') ?? ''),
        api_key:     String(formData.get('cards_api_key') ?? ''),
        environment: (formData.get('cards_environment') as 'sandbox' | 'production') ?? 'sandbox',
      },
      cod: {
        enabled:               formData.get('cod_enabled') === 'on',
        nairobi_only:          true,
        confirmation_required: true,
      },
    }
    await upsertSetting('payments', value)
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// ─── Logistics Settings ───────────────────────────────────────────────────────

export async function saveLogisticsSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  try {
    const categories = String(formData.get('truck_categories') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const value: LogisticsSettings = {
      pickup_mtaani: {
        enabled:   formData.get('pickup_enabled') === 'on',
        api_key:   String(formData.get('pickup_api_key') ?? ''),
        api_url:   String(formData.get('pickup_api_url') ?? 'https://api.pickupmtaani.com/api/v1'),
        stub_mode: true, // Always true until explicitly activated
      },
      self_pickup: {
        enabled: formData.get('self_pickup_enabled') === 'on',
        address: String(formData.get('self_pickup_address') ?? ''),
        hours:   String(formData.get('self_pickup_hours') ?? ''),
      },
      truck_delivery: {
        enabled:                    formData.get('truck_enabled') === 'on',
        staff_confirmation_required: true,
        eligible_categories:        categories,
        base_fee:                   Number(formData.get('truck_base_fee') ?? 0),
      },
    }
    await upsertSetting('logistics', value)
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// ─── Notification Settings ────────────────────────────────────────────────────

export async function saveNotificationSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  try {
    const notify_emails = String(formData.get('notify_emails') ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const notify_phones = String(formData.get('notify_phones') ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const value: NotificationSettings = {
      email: {
        enabled:      formData.get('email_enabled') === 'on',
        provider:     'resend',
        api_key:      String(formData.get('resend_api_key') ?? ''),
        from_address: String(formData.get('email_from') ?? 'orders@bewama.com'),
      },
      sms: {
        enabled:   formData.get('sms_enabled') === 'on',
        provider:  'africas_talking',
        api_key:   String(formData.get('at_api_key') ?? ''),
        username:  String(formData.get('at_username') ?? ''),
        sender_id: String(formData.get('at_sender_id') ?? 'BEWAMA'),
        stub_mode: true, // Always true until activated
      },
      new_order_email:     formData.get('new_order_email') === 'on',
      new_order_sms:       formData.get('new_order_sms') === 'on',
      new_quote_email:     formData.get('new_quote_email') === 'on',
      new_quote_sms:       formData.get('new_quote_sms') === 'on',
      low_stock_threshold: Number(formData.get('low_stock_threshold') ?? 10),
      notify_emails,
      notify_phones,
    }
    await upsertSetting('notifications', value)
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
