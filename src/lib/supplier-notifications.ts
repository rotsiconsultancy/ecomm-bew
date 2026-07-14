import React from 'react'
import { sendEmail } from '@/lib/email'
import { createServiceClient } from '@/lib/supabase/server'
import { SupplierNotificationEmail } from '@/emails/supplier-notification'
import type { SupplierEventKey } from '@/types/supplier'

interface SupplierEmailInput {
  supplierId?: string | null
  eventKey: SupplierEventKey
  to: string | string[]
  subject: string
  title: string
  message: string
  ctaLabel?: string
  ctaUrl?: string
  details?: { label: string; value: string }[]
  relatedOrderId?: string | null
  relatedFulfilmentId?: string | null
  relatedProductId?: string | null
}

export async function sendSupplierEmail(input: SupplierEmailInput) {
  const recipients = Array.isArray(input.to) ? input.to : [input.to]
  const supabase = await createServiceClient()

  const result = await sendEmail({
    to: recipients,
    subject: input.subject,
    react: React.createElement(SupplierNotificationEmail, {
      preview: input.subject,
      title: input.title,
      message: input.message,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      details: input.details,
    }),
  })

  await Promise.allSettled(
    recipients.map((recipient) =>
      supabase.from('supplier_notification_logs').insert({
        supplier_id: input.supplierId ?? null,
        event_key: input.eventKey,
        recipient_email: recipient,
        subject: input.subject,
        status: result.success ? 'sent' : 'failed',
        related_order_id: input.relatedOrderId ?? null,
        related_fulfilment_id: input.relatedFulfilmentId ?? null,
        related_product_id: input.relatedProductId ?? null,
        error_message: result.error ?? null,
      })
    )
  )

  return result
}

export async function getSupplierNotificationRecipients(supplierId: string, eventKey: SupplierEventKey) {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('supplier_notification_emails')
    .select('email, events, is_active')
    .eq('supplier_id', supplierId)
    .eq('is_active', true)

  const emails = (data ?? [])
    .filter((row) => Array.isArray(row.events) && (row.events.length === 0 || row.events.includes(eventKey)))
    .map((row) => row.email)

  if (emails.length > 0) return emails

  const { data: members } = await supabase
    .from('supplier_members')
    .select('email, member_role, status')
    .eq('supplier_id', supplierId)
    .eq('status', 'active')
    .in('member_role', ['owner', 'manager'])

  return [...new Set((members ?? []).map((m) => m.email).filter(Boolean))]
}
