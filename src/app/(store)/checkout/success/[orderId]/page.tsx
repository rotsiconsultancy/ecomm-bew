import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getUserPointsBalance } from '@/lib/points'
import { getPostPurchasePrompts } from '@/lib/checkout'
import { SuccessView } from './success-view'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function CheckoutSuccessPage({ params }: Props) {
  const { orderId } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const [balance, prompts] = await Promise.all([
    getUserPointsBalance(user.id),
    getPostPurchasePrompts(),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SuccessView
        orderId={orderId}
        pointsBalance={balance}
        prompts={prompts}
        userId={user.id}
      />
    </div>
  )
}
