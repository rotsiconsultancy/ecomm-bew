export interface SiteSettings {
  name: string
  tagline: string
  logo_url: string
  favicon_url: string
  contact_email: string
  contact_phone: string
  address: string
  social_links: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    whatsapp?: string
  }
  business_hours: string
  default_currency: 'KES' | 'EUR' | 'USD'
}

export interface PaymentCredentials {
  rotsi: {
    consumer_key: string
    consumer_secret: string
    shortcode: string
    passkey: string
    environment: 'sandbox' | 'production'
  }
  paypal: {
    client_id: string
    client_secret: string
    environment: 'sandbox' | 'production'
  }
  cards: {
    provider: string
    api_key: string
    environment: 'sandbox' | 'production'
  }
  cod: {
    nairobi_only: true
    confirmation_required: true
  }
}

/** @deprecated Use PaymentCredentials — enabled flags now live in payment_methods table */
export type PaymentSettings = PaymentCredentials

export interface LogisticsSettings {
  pickup_mtaani: {
    enabled: boolean
    api_key: string
    api_url: string
    stub_mode: boolean
  }
  self_pickup: {
    enabled: boolean
    address: string
    hours: string
  }
  truck_delivery: {
    enabled: boolean
    staff_confirmation_required: true
    eligible_categories: string[]
    base_fee: number
  }
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    provider: 'resend'
    api_key: string
    from_address: string
  }
  sms: {
    enabled: boolean
    provider: 'africas_talking'
    api_key: string
    username: string
    sender_id: string
    stub_mode: boolean
  }
  new_order_email: boolean
  new_order_sms: boolean
  new_quote_email: boolean
  new_quote_sms: boolean
  low_stock_threshold: number
  notify_emails: string[]
  notify_phones: string[]
}

export interface AllSettings {
  site: SiteSettings
  credentials: PaymentCredentials
  logistics: LogisticsSettings
  notifications: NotificationSettings
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SITE: SiteSettings = {
  name: 'Bewama',
  tagline: 'Industrial Materials & Brokerage',
  logo_url: '',
  favicon_url: '',
  contact_email: 'info@bewama.com',
  contact_phone: '',
  address: '',
  social_links: {},
  business_hours: 'Mon–Fri, 8am–6pm EAT',
  default_currency: 'KES',
}

export const DEFAULT_CREDENTIALS: PaymentCredentials = {
  rotsi:  { consumer_key: '', consumer_secret: '', shortcode: '', passkey: '', environment: 'sandbox' },
  paypal: { client_id: '', client_secret: '', environment: 'sandbox' },
  cards:  { provider: '', api_key: '', environment: 'sandbox' },
  cod:    { nairobi_only: true, confirmation_required: true },
}

/** @deprecated Use DEFAULT_CREDENTIALS */
export const DEFAULT_PAYMENTS = DEFAULT_CREDENTIALS

export const DEFAULT_LOGISTICS: LogisticsSettings = {
  pickup_mtaani: { enabled: false, api_key: '', api_url: 'https://api.pickupmtaani.com/api/v1', stub_mode: true },
  self_pickup:   { enabled: true, address: '', hours: '' },
  truck_delivery: { enabled: true, staff_confirmation_required: true, eligible_categories: [], base_fee: 0 },
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  email: { enabled: false, provider: 'resend', api_key: '', from_address: 'orders@bewama.com' },
  sms:   { enabled: false, provider: 'africas_talking', api_key: '', username: '', sender_id: 'BEWAMA', stub_mode: true },
  new_order_email: true,
  new_order_sms:   false,
  new_quote_email: true,
  new_quote_sms:   false,
  low_stock_threshold: 10,
  notify_emails: [],
  notify_phones: [],
}
