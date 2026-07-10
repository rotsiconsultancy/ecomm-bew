'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { sendOrderNotifications, sendQuoteNotifications } from '@/lib/notifications'
import { finaliseRedemption } from '@/lib/points'
import { getDeliveryFee, updateInfluencePreference } from '@/lib/checkout'
import { groupCartForSupplierCheckout } from '@/lib/suppliers'
import { getSupplierNotificationRecipients, sendSupplierEmail } from '@/lib/supplier-notifications'
import type { CartItem } from '@/lib/cart-store'
import type { CheckoutFulfilmentGroup } from '@/lib/suppliers'

type CheckoutItemInput = {
  product_id: string
  name: string
  slug?: string
  price: number
  currency: string
  quantity: number
  image: string | null
}

type ShippingAddressInput = {
  full_name: string
  phone: string
  email: string
  delivery_address: string
  city: string
  notes: string
  delivery_region_id?: string | null
}

function toCartItems(items: CheckoutItemInput[]): CartItem[] {
  return items.map((item) => ({
    product_id: item.product_id,
    name: item.name,
    slug: item.slug ?? item.product_id,
    price: Number(item.price),
    currency: item.currency ?? 'KES',
    quantity: Number(item.quantity),
    image: item.image,
  }))
}

function groupItems(groups: CheckoutFulfilmentGroup[]) {
  return groups.flatMap((group) => group.items)
}

function groupSubtotal(groups: CheckoutFulfilmentGroup[]) {
  return groups.reduce((sum, group) => sum + group.subtotal, 0)
}

function groupDeliveryTotal(groups: CheckoutFulfilmentGroup[]) {
  return groups.reduce((sum, group) => sum + group.delivery_fee, 0)
}

function quoteItems(group: CheckoutFulfilmentGroup) {
  return group.items.map((item) => ({
    product_name: item.name,
    quantity: item.quantity,
    unit: 'pcs',
  }))
}

async function buildCheckoutSplit(items: CheckoutItemInput[], regionId?: string | null) {
  const cartItems = toCartItems(items)
  const split = await groupCartForSupplierCheckout(cartItems, regionId)
  const bewamaDeliveryFee = await getDeliveryFee()

  const eligible = split.eligible.map((group) => ({
    ...group,
    delivery_fee: group.owner === 'bewama' ? bewamaDeliveryFee : group.delivery_fee,
  }))

  return {
    eligible,
    support: split.support,
    eligibleSubtotal: groupSubtotal(eligible),
    eligibleDeliveryTotal: groupDeliveryTotal(eligible),
    supportSubtotal: groupSubtotal(split.support),
  }
}

export async function previewSupplierCheckout(items: CheckoutItemInput[], deliveryRegionId?: string | null) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const split = await buildCheckoutSplit(items, deliveryRegionId)
  return {
    success: true,
    ...split,
  }
}

async function createSupportRequests(input: {
  userId: string
  groups: CheckoutFulfilmentGroup[]
  shippingAddress: ShippingAddressInput
  sourceOrderId?: string | null
}) {
  if (input.groups.length === 0) return [] as string[]

  const supabase = await createServiceClient()
  const quoteIds: string[] = []

  for (const group of input.groups) {
    const message = [
      'Supplier delivery support request from checkout.',
      group.support_reason ? `Reason: ${group.support_reason}` : null,
      input.sourceOrderId ? `Paid order: ${input.sourceOrderId}` : null,
    ].filter(Boolean).join('\n')

    const { data: quote } = await supabase
      .from('quotes')
      .insert({
        user_id: input.userId,
        full_name: input.shippingAddress.full_name,
        email: input.shippingAddress.email,
        phone: input.shippingAddress.phone || null,
        company: null,
        message,
        items: quoteItems(group),
        status: 'pending',
        quote_type: 'supplier_support',
        source_order_id: input.sourceOrderId ?? null,
        source_cart_snapshot: {
          shipping_address: input.shippingAddress,
          group,
        },
        support_items: group.items,
        delivery_region_id: input.shippingAddress.delivery_region_id ?? null,
        supplier_id: group.supplier_id,
      })
      .select('id')
      .maybeSingle()

    if (quote?.id) {
      quoteIds.push(quote.id)
      void sendQuoteNotifications({
        id: quote.id,
        full_name: input.shippingAddress.full_name,
        email: input.shippingAddress.email,
        phone: input.shippingAddress.phone || undefined,
        items: quoteItems(group),
        message,
      })
    }
  }

  revalidatePath('/admin/quote-management')
  return quoteIds
}

async function notifySupplierFulfilment(group: CheckoutFulfilmentGroup, fulfilmentId: string, orderId: string) {
  if (!group.supplier_id) return

  const recipients = await getSupplierNotificationRecipients(group.supplier_id, 'new_supplier_fulfilment')
  if (recipients.length === 0) return

  await sendSupplierEmail({
    supplierId: group.supplier_id,
    eventKey: 'new_supplier_fulfilment',
    to: recipients,
    subject: `New Bewama fulfilment for order ${orderId.slice(0, 8).toUpperCase()}`,
    title: 'New fulfilment received',
    message: 'A paid order includes items your team needs to fulfil. Review the fulfilment in your supplier portal.',
    ctaLabel: 'Open supplier portal',
    ctaUrl: '/supplier-portal?tab=orders',
    relatedOrderId: orderId,
    relatedFulfilmentId: fulfilmentId,
    details: [
      { label: 'Items', value: String(group.items.reduce((sum, item) => sum + item.quantity, 0)) },
      { label: 'Subtotal', value: `${group.currency} ${group.subtotal.toLocaleString()}` },
      { label: 'Delivery fee', value: `${group.currency} ${group.delivery_fee.toLocaleString()}` },
      { label: 'Region', value: group.region_name ?? 'Not set' },
    ],
  })
}

export async function createOrder(
  _userId: string, // kept for backwards compat — actual userId read from auth
  items: CheckoutItemInput[],
  shippingAddress: ShippingAddressInput,
  totalAmount: number
) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabase = await createServiceClient()
  const split = await buildCheckoutSplit(items, shippingAddress.delivery_region_id)
  const eligibleItems = groupItems(split.eligible)

  if (eligibleItems.length === 0) {
    const supportQuoteIds = await createSupportRequests({
      userId: user.id,
      groups: split.support,
      shippingAddress,
      sourceOrderId: null,
    })

    return {
      success: supportQuoteIds.length > 0,
      id: null,
      supportOnly: true,
      supportQuoteIds,
      error: supportQuoteIds.length === 0 ? 'No checkout items were eligible for payment or support.' : undefined,
    }
  }

  const calculatedTotal = split.eligibleSubtotal + split.eligibleDeliveryTotal
  const trustedTotal = Number.isFinite(totalAmount)
    ? Math.max(0, Math.min(totalAmount, calculatedTotal))
    : calculatedTotal

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_amount: trustedTotal,
      currency: eligibleItems[0]?.currency ?? 'KES',
      shipping_address: {
        ...shippingAddress,
        supplier_checkout: {
          eligible_groups: split.eligible.map((group) => ({
            key: group.key,
            supplier_id: group.supplier_id,
            owner: group.owner,
            subtotal: group.subtotal,
            delivery_fee: group.delivery_fee,
            delivery_region_id: group.region_id,
            lead_time_min_days: group.lead_time_min_days,
            lead_time_max_days: group.lead_time_max_days,
          })),
          support_groups: split.support.map((group) => ({
            key: group.key,
            supplier_id: group.supplier_id,
            subtotal: group.subtotal,
            reason: group.support_reason,
          })),
        },
      },
      items: eligibleItems,
      notes: shippingAddress.notes || null,
    })
    .select('id')
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  const fulfilmentRows = split.eligible.map((group) => ({
    order_id: data?.id,
    supplier_id: group.supplier_id,
    fulfilment_owner: group.owner,
    status: 'new',
    items: group.items,
    subtotal_amount: group.subtotal,
    delivery_fee: group.delivery_fee,
    currency: group.currency,
    delivery_region_id: group.region_id,
    lead_time_min_days: group.lead_time_min_days,
    lead_time_max_days: group.lead_time_max_days,
  }))

  if (data?.id && fulfilmentRows.length > 0) {
    const { data: fulfilments } = await supabase
      .from('supplier_fulfilments')
      .insert(fulfilmentRows)
      .select('id, supplier_id')

    for (const fulfilment of fulfilments ?? []) {
      const group = split.eligible.find((g) => g.supplier_id === fulfilment.supplier_id)
      if (group?.supplier_id) {
        void notifySupplierFulfilment(group, fulfilment.id, data.id)
      }
    }
  }

  const supportQuoteIds = data?.id
    ? await createSupportRequests({
        userId: user.id,
        groups: split.support,
        shippingAddress,
        sourceOrderId: data.id,
      })
    : []

  revalidatePath('/admin/order-management')
  revalidatePath('/admin/suppliers')
  revalidatePath('/supplier-portal')

  // Fire-and-forget — never block order confirmation on email/SMS or points
  if (data?.id) {
    void sendOrderNotifications({
      id:              data.id,
      customer_name:   shippingAddress.full_name,
      customer_email:  shippingAddress.email,
      customer_phone:  shippingAddress.phone || undefined,
      items:           eligibleItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, currency: i.currency })),
      total:           trustedTotal,
      currency:        eligibleItems[0]?.currency ?? 'KES',
      delivery_method: shippingAddress.city ? `Delivery to ${shippingAddress.city}` : 'Delivery',
    })

    // Finalise any pending points redemption — attach to this order
    void finaliseRedemption(user.id, data.id)
  }

  return { success: true, id: data?.id, supportQuoteIds }
}

// ─── Toggle user influence preference ────────────────────────────────────────

export async function toggleInfluenceAction(enabled: boolean) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  await updateInfluencePreference(user.id, enabled)
  return { success: true }
}
