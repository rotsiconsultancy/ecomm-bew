import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getUserPointsBalance } from '@/lib/points'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Order Confirmed | Bewama',
  robots: { index: false, follow: false },
}
import { getPostPurchasePrompts } from '@/lib/checkout'
import { SuccessView } from './success-view'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function CheckoutSuccessPage({ params }: Props) {
  const { orderId } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServiceClient()
  const [balance, prompts, fulfilmentsRes, supportRes] = await Promise.all([
    getUserPointsBalance(user.id),
    getPostPurchasePrompts(),
    supabase
      .from('supplier_fulfilments')
      .select('id, fulfilment_owner, status, items, subtotal_amount, delivery_fee, currency, lead_time_min_days, lead_time_max_days')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
    supabase
      .from('quotes')
      .select('id, items, status, support_items')
      .eq('source_order_id', orderId)
      .eq('quote_type', 'supplier_support')
      .order('created_at', { ascending: true }),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SuccessView
        orderId={orderId}
        pointsBalance={balance}
        prompts={prompts}
        fulfilments={fulfilmentsRes.data ?? []}
        supportRequests={supportRes.data ?? []}
      />
    </div>
  )
}
