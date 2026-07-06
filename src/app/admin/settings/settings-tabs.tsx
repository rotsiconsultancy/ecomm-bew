'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Plus, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { AllSettings } from '@/types/settings'
import {
  saveSiteSettings,
  saveCredentialsSettings,
  saveLogisticsSettings,
  saveNotificationSettings,
} from './actions'

// ─── Primitives ───────────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function PasswordInput({ name, defaultValue = '', placeholder }: { name: string; defaultValue?: string; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        name={name}
        type={show ? 'text' : 'password'}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="pr-10 bg-gray-50 border-gray-200 rounded-lg"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

function Toggle({ name, defaultChecked = false, label }: { name: string; defaultChecked?: boolean; label: string }) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none min-w-0">
      <input type="hidden" name={name} value={on ? 'on' : 'off'} />
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative overflow-hidden ${on ? 'bg-[#061f3f]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className="text-sm font-medium text-gray-700 leading-snug">{label}</span>
    </label>
  )
}

function EnvSelect({ name, defaultValue = 'sandbox' }: { name: string; defaultValue?: string }) {
  return (
    <select name={name} defaultValue={defaultValue} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-[#061f3f] outline-none">
      <option value="sandbox">Sandbox</option>
      <option value="production">Production</option>
    </select>
  )
}

function InfoBanner({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' }) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${variant === 'warning' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function SectionCard({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-[#061f3f] text-sm">{title}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  )
}

function SaveBar({ isPending, result }: { isPending: boolean; result: { success: boolean; error?: string } | null }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      {result && (
        <div className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-500'}`}>
          <CheckCircle2 className="w-4 h-4" />
          {result.success ? 'Saved successfully' : result.error ?? 'Save failed'}
        </div>
      )}
      <div className="ml-auto">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#061f3f] hover:bg-[#03152d] text-white font-bold rounded-lg px-6 h-10"
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

// ─── Dynamic list (emails / phones) ──────────────────────────────────────────

function DynamicList({ name, defaultItems = [], placeholder }: { name: string; defaultItems?: string[]; placeholder?: string }) {
  const [items, setItems] = useState<string[]>(defaultItems)
  const [input, setInput] = useState('')

  function add() {
    const v = input.trim()
    if (v && !items.includes(v)) setItems([...items, v])
    setInput('')
  }

  return (
    <div className="space-y-2">
      <textarea name={name} hidden readOnly value={items.join('\n')} />
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="bg-gray-50 border-gray-200 rounded-lg text-sm"
        />
        <Button type="button" onClick={add} variant="outline" size="icon" className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} className="bg-gray-100 text-gray-700 border-none font-normal pr-1 flex items-center gap-1">
              {item}
              <button type="button" onClick={() => setItems(items.filter((i) => i !== item))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab 1 — Site Details ─────────────────────────────────────────────────────

export function SiteTab({ s }: { s: AllSettings['site'] }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  function submit(formData: FormData) {
    startTransition(async () => {
      const r = await saveSiteSettings(formData)
      setResult(r)
    })
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Store Name">
          <Input name="name" defaultValue={s.name} className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Tagline">
          <Input name="tagline" defaultValue={s.tagline} className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Logo URL">
          <Input name="logo_url" defaultValue={s.logo_url} placeholder="https://…" className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Favicon URL">
          <Input name="favicon_url" defaultValue={s.favicon_url} placeholder="https://…" className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Contact Email">
          <Input name="contact_email" type="email" defaultValue={s.contact_email} className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Contact Phone">
          <Input name="contact_phone" defaultValue={s.contact_phone} placeholder="+254 …" className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Business Hours">
          <Input name="business_hours" defaultValue={s.business_hours} placeholder="Mon–Fri, 8am–6pm EAT" className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Default Currency">
          <select name="default_currency" defaultValue={s.default_currency} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-[#061f3f] outline-none">
            <option value="KES">KES — Kenyan Shilling</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — US Dollar</option>
          </select>
        </Field>
      </div>
      <Field label="Address">
        <textarea name="address" defaultValue={s.address} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-[#061f3f] outline-none resize-none" />
      </Field>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Social Links</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp'] as const).map((platform) => (
            <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
              <Input
                name={`social_${platform}`}
                defaultValue={s.social_links[platform] ?? ''}
                placeholder={`https://…`}
                className="bg-gray-50 border-gray-200 rounded-lg"
              />
            </Field>
          ))}
        </div>
      </div>
      <SaveBar isPending={isPending} result={result} />
    </form>
  )
}

// ─── Tab 2 — Credentials ─────────────────────────────────────────────────────
// Enabled/disabled toggles live in /admin/checkout → Payment Methods tab.
// This tab is credentials-only.

export function CredentialsTab({ s }: { s: AllSettings['credentials'] }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  function submit(formData: FormData) {
    startTransition(async () => {
      const r = await saveCredentialsSettings(formData)
      setResult(r)
    })
  }

  return (
    <form action={submit} className="space-y-4">
      <InfoBanner>
        These are API credentials only. To enable or disable payment methods for customers,
        go to <strong>Checkout → Payment Methods</strong>.
      </InfoBanner>

      {/* Rotsi / M-Pesa */}
      <SectionCard title="Rotsi (M-Pesa)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Consumer Key">
            <PasswordInput name="rotsi_consumer_key" defaultValue={s.rotsi.consumer_key} />
          </Field>
          <Field label="Consumer Secret">
            <PasswordInput name="rotsi_consumer_secret" defaultValue={s.rotsi.consumer_secret} />
          </Field>
          <Field label="Shortcode">
            <Input name="rotsi_shortcode" defaultValue={s.rotsi.shortcode} className="bg-gray-50 border-gray-200 rounded-lg" />
          </Field>
          <Field label="Passkey">
            <PasswordInput name="rotsi_passkey" defaultValue={s.rotsi.passkey} />
          </Field>
          <Field label="Environment">
            <EnvSelect name="rotsi_environment" defaultValue={s.rotsi.environment} />
          </Field>
        </div>
        <InfoBanner>Get your credentials from your Rotsi dashboard at rotsi.co.ke</InfoBanner>
      </SectionCard>

      {/* PayPal */}
      <SectionCard title="PayPal" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Client ID">
            <PasswordInput name="paypal_client_id" defaultValue={s.paypal.client_id} />
          </Field>
          <Field label="Client Secret">
            <PasswordInput name="paypal_client_secret" defaultValue={s.paypal.client_secret} />
          </Field>
          <Field label="Environment">
            <EnvSelect name="paypal_environment" defaultValue={s.paypal.environment} />
          </Field>
        </div>
        <InfoBanner variant="warning">Coming Soon — PayPal integration is not yet active.</InfoBanner>
      </SectionCard>

      {/* Card Payments */}
      <SectionCard title="Card Payments" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Provider Name">
            <Input name="cards_provider" defaultValue={s.cards.provider} placeholder="e.g. Stripe, Flutterwave" className="bg-gray-50 border-gray-200 rounded-lg" />
          </Field>
          <Field label="API Key">
            <PasswordInput name="cards_api_key" defaultValue={s.cards.api_key} />
          </Field>
          <Field label="Environment">
            <EnvSelect name="cards_environment" defaultValue={s.cards.environment} />
          </Field>
        </div>
        <InfoBanner variant="warning">Coming Soon — Card integration is not yet active.</InfoBanner>
      </SectionCard>

      {/* COD */}
      <SectionCard title="Cash on Delivery" defaultOpen={false}>
        <InfoBanner>Nairobi only. Staff will call to confirm before dispatch. No API credentials needed.</InfoBanner>
      </SectionCard>

      <SaveBar isPending={isPending} result={result} />
    </form>
  )
}

// ─── Tab 3 — Logistics ────────────────────────────────────────────────────────

export function LogisticsTab({ s }: { s: AllSettings['logistics'] }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  function submit(formData: FormData) {
    startTransition(async () => {
      const r = await saveLogisticsSettings(formData)
      setResult(r)
    })
  }

  return (
    <form action={submit} className="space-y-4">
      {/* Pickup Mtaani */}
      <SectionCard title="Pickup Mtaani">
        <Toggle name="pickup_enabled" defaultChecked={s.pickup_mtaani.enabled} label="Enable Pickup Mtaani" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="API Key">
            <PasswordInput name="pickup_api_key" defaultValue={s.pickup_mtaani.api_key} />
          </Field>
          <Field label="API URL">
            <Input name="pickup_api_url" defaultValue={s.pickup_mtaani.api_url} className="bg-gray-50 border-gray-200 rounded-lg" />
          </Field>
        </div>
        <InfoBanner>Stub mode active. Configure credentials now, activate when ready by contacting Pickup Mtaani.</InfoBanner>
      </SectionCard>

      {/* Self Pickup */}
      <SectionCard title="Self Pickup / Showroom" defaultOpen={false}>
        <Toggle name="self_pickup_enabled" defaultChecked={s.self_pickup.enabled} label="Enable self pickup" />
        <Field label="Pickup Address">
          <textarea name="self_pickup_address" defaultValue={s.self_pickup.address} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-[#061f3f] outline-none resize-none" />
        </Field>
        <Field label="Hours">
          <Input name="self_pickup_hours" defaultValue={s.self_pickup.hours} placeholder="Mon–Fri 9am–5pm" className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
      </SectionCard>

      {/* Truck Delivery */}
      <SectionCard title="Truck / Bulky Delivery" defaultOpen={false}>
        <Toggle name="truck_enabled" defaultChecked={s.truck_delivery.enabled} label="Enable truck delivery" />
        <InfoBanner>Staff will contact the customer to confirm delivery date and logistics before dispatch.</InfoBanner>
        <Field label="Eligible Categories (comma-separated)" hint="e.g. Construction, Heavy Machinery, Bulk Materials">
          <Input name="truck_categories" defaultValue={s.truck_delivery.eligible_categories.join(', ')} className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
        <Field label="Base Delivery Fee (KES)">
          <Input name="truck_base_fee" type="number" min={0} defaultValue={s.truck_delivery.base_fee} className="bg-gray-50 border-gray-200 rounded-lg" />
        </Field>
      </SectionCard>

      <SaveBar isPending={isPending} result={result} />
    </form>
  )
}

// ─── Tab 4 — Notifications ────────────────────────────────────────────────────

export function NotificationsTab({ s }: { s: AllSettings['notifications'] }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  function submit(formData: FormData) {
    startTransition(async () => {
      const r = await saveNotificationSettings(formData)
      setResult(r)
    })
  }

  return (
    <form action={submit} className="space-y-5">
      {/* Email */}
      <div className="border border-gray-100 rounded-xl p-5 space-y-4">
        <p className="font-semibold text-[#061f3f] text-sm">Email (Resend)</p>
        <Toggle name="email_enabled" defaultChecked={s.email.enabled} label="Enable email notifications" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Resend API Key" hint="Get your key at resend.com/api-keys">
            <PasswordInput name="resend_api_key" defaultValue={s.email.api_key} placeholder="re_…" />
          </Field>
          <Field label="From Address" hint="Must be a verified sender in Resend">
            <Input name="email_from" defaultValue={s.email.from_address} placeholder="orders@bewama.com" className="bg-gray-50 border-gray-200 rounded-lg" />
          </Field>
        </div>
      </div>

      {/* SMS */}
      <div className="border border-gray-100 rounded-xl p-5 space-y-4">
        <p className="font-semibold text-[#061f3f] text-sm">SMS (Africa&apos;s Talking)</p>
        <Toggle name="sms_enabled" defaultChecked={s.sms.enabled} label="Enable SMS notifications" />
        <InfoBanner>Stub mode active — SMS will be logged to console. Activate by disabling stub mode in code once credentials are verified.</InfoBanner>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="API Key">
            <PasswordInput name="at_api_key" defaultValue={s.sms.api_key} />
          </Field>
          <Field label="Username">
            <Input name="at_username" defaultValue={s.sms.username} className="bg-gray-50 border-gray-200 rounded-lg" />
          </Field>
          <Field label="Sender ID" hint="Max 11 characters, e.g. BEWAMA">
            <Input name="at_sender_id" defaultValue={s.sms.sender_id} maxLength={11} placeholder="BEWAMA" className="bg-gray-50 border-gray-200 rounded-lg" />
          </Field>
        </div>
      </div>

      {/* Alert toggles */}
      <div className="border border-gray-100 rounded-xl p-5 space-y-3">
        <p className="font-semibold text-[#061f3f] text-sm mb-1">Alert Triggers</p>
        <Toggle name="new_order_email" defaultChecked={s.new_order_email} label="New order — send email" />
        <Toggle name="new_order_sms"   defaultChecked={s.new_order_sms}   label="New order — send SMS" />
        <Toggle name="new_quote_email" defaultChecked={s.new_quote_email} label="New quote — send email" />
        <Toggle name="new_quote_sms"   defaultChecked={s.new_quote_sms}   label="New quote — send SMS" />
        <Field label="Low stock threshold" hint="Alert when product stock drops to or below this number">
          <Input name="low_stock_threshold" type="number" min={1} defaultValue={s.low_stock_threshold} className="bg-gray-50 border-gray-200 rounded-lg w-32" />
        </Field>
      </div>

      {/* Notify lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Notify Emails" hint="Press Enter or + to add">
          <DynamicList name="notify_emails" defaultItems={s.notify_emails} placeholder="admin@bewama.com" />
        </Field>
        <Field label="Notify Phones" hint="Include country code, e.g. +254…">
          <DynamicList name="notify_phones" defaultItems={s.notify_phones} placeholder="+254…" />
        </Field>
      </div>

      <SaveBar isPending={isPending} result={result} />
    </form>
  )
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────

export type TabKey = 'site' | 'credentials' | 'logistics' | 'notifications'

export function SettingsTabs({ settings }: { settings: AllSettings }) {
  const [tab, setTab] = useState<TabKey>('site')

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'site',          label: 'Site Details' },
    { key: 'credentials',   label: 'Credentials' },
    { key: 'logistics',     label: 'Logistics' },
    { key: 'notifications', label: 'Notifications' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-semibold transition-colors rounded-t-lg ${
              tab === key
                ? 'text-[#061f3f] border-b-2 border-[#061f3f] -mb-px bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'site'          && <SiteTab          s={settings.site}          />}
      {tab === 'credentials'   && <CredentialsTab    s={settings.credentials}   />}
      {tab === 'logistics'     && <LogisticsTab      s={settings.logistics}     />}
      {tab === 'notifications' && <NotificationsTab  s={settings.notifications} />}
    </div>
  )
}
