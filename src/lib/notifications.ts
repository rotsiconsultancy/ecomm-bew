import React from 'react'
import { getSetting } from '@/lib/settings'
import { sendEmail } from '@/lib/email'
import { sendSMS } from '@/lib/sms'
import { createServiceClient } from '@/lib/supabase/server'
import type { NotificationSettings } from '@/types/settings'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'
import { NewOrderAlertEmail } from '@/emails/new-order-alert'
import { QuoteReceivedEmail } from '@/emails/quote-received'
import { LowStockAlertEmail } from '@/emails/low-stock-alert'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderPayload {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  items: { name: string; quantity: number; price: number; currency: string }[]
  total: number
  currency: string
  delivery_method: string
}

interface QuotePayload {
  id: string
  full_name: string
  email: string
  phone?: string
  items: { product_name: string; quantity: number; unit: string }[]
  message?: string
}

interface LowStockProduct {
  name: string
  stock: number
  category: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortId(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

async function getNotifSettings(): Promise<NotificationSettings | null> {
  return getSetting<NotificationSettings>('notifications')
}

// ─── Order Notifications ──────────────────────────────────────────────────────

export async function sendOrderNotifications(order: OrderPayload): Promise<void> {
  const cfg = await getNotifSettings()
  if (!cfg) return

  const promises: Promise<unknown>[] = []

  if (cfg.new_order_email && cfg.email.enabled) {
    // Customer confirmation
    promises.push(
      sendEmail({
        to: order.customer_email,
        subject: `Order #${shortId(order.id)} Confirmed — Bewama`,
        react: React.createElement(OrderConfirmationEmail, {
          orderId:        order.id,
          customerName:   order.customer_name,
          items:          order.items,
          total:          order.total,
          currency:       order.currency,
          deliveryMethod: order.delivery_method,
        }),
      })
    )

    // Staff alert emails
    for (const email of cfg.notify_emails) {
      promises.push(
        sendEmail({
          to: email,
          subject: `New Order #${shortId(order.id)} from ${order.customer_name}`,
          react: React.createElement(NewOrderAlertEmail, {
            orderId:        order.id,
            customerName:   order.customer_name,
            total:          order.total,
            items:          order.items,
            deliveryMethod: order.delivery_method,
          }),
        })
      )
    }
  }

  if (cfg.new_order_sms && cfg.sms.enabled) {
    const msg = `Bewama: Order #${shortId(order.id)} confirmed. Total: ${order.currency} ${order.total.toLocaleString()}. We'll be in touch.`

    if (order.customer_phone) {
      promises.push(sendSMS({ to: order.customer_phone, message: msg }))
    }
    for (const phone of cfg.notify_phones) {
      promises.push(sendSMS({ to: phone, message: msg }))
    }
  }

  await Promise.allSettled(promises)
}

// ─── Quote Notifications ──────────────────────────────────────────────────────

export async function sendQuoteNotifications(quote: QuotePayload): Promise<void> {
  const cfg = await getNotifSettings()
  if (!cfg) return

  const promises: Promise<unknown>[] = []

  if (cfg.new_quote_email && cfg.email.enabled) {
    // Customer confirmation
    promises.push(
      sendEmail({
        to: quote.email,
        subject: `Quote Request Received — Ref #${shortId(quote.id)}`,
        react: React.createElement(QuoteReceivedEmail, {
          quoteId:      quote.id,
          customerName: quote.full_name,
          items:        quote.items,
          message:      quote.message,
        }),
      })
    )

    // Staff alert emails
    for (const email of cfg.notify_emails) {
      promises.push(
        sendEmail({
          to: email,
          subject: `New Quote Request from ${quote.full_name} — Ref #${shortId(quote.id)}`,
          react: React.createElement(NewOrderAlertEmail, {
            orderId:        quote.id,
            customerName:   quote.full_name,
            total:          0,
            items:          quote.items.map((i) => ({ name: i.product_name, quantity: i.quantity, price: 0, currency: 'KES' })),
            deliveryMethod: 'Quote',
          }),
        })
      )
    }
  }

  if (cfg.new_quote_sms && cfg.sms.enabled) {
    const msg = `Bewama: New quote request from ${quote.full_name}. Ref: #${shortId(quote.id)}`
    for (const phone of cfg.notify_phones) {
      promises.push(sendSMS({ to: phone, message: msg }))
    }
  }

  await Promise.allSettled(promises)
}

// ─── Low Stock Check ──────────────────────────────────────────────────────────

export async function checkLowStock(): Promise<LowStockProduct[]> {
  const cfg = await getNotifSettings()
  const threshold = cfg?.low_stock_threshold ?? 10

  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('name, stock, category')
    .lte('stock', threshold)
    .gt('stock', 0)
    .eq('is_active', true)
    .order('stock', { ascending: true })

  const products: LowStockProduct[] = (data ?? []).map((p) => ({
    name:     p.name,
    stock:    p.stock,
    category: p.category ?? null,
  }))

  if (products.length > 0 && cfg?.new_order_email && cfg.email.enabled && cfg.notify_emails.length > 0) {
    const promises = cfg.notify_emails.map((email) =>
      sendEmail({
        to: email,
        subject: `⚠️ Low Stock Alert — ${products.length} product${products.length !== 1 ? 's' : ''} need attention`,
        react: React.createElement(LowStockAlertEmail, { products }),
      })
    )
    await Promise.allSettled(promises)
  }

  return products
}
