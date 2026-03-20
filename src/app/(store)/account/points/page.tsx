import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import {
  getUserPointsBalance,
  getUserLedger,
  getPendingRedemption,
  getEarnActions,
} from '@/lib/points'
import { PointsHub } from './points-hub'

export const metadata = {
  title: 'Bewama Points | My Rewards',
  description: 'Earn and redeem Bewama Points for discounts on construction materials.',
}

export default async function PointsPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirectTo=/account/points')

  const [balance, ledger, pendingRedemption, earnActions] = await Promise.all([
    getUserPointsBalance(user.id),
    getUserLedger(user.id),
    getPendingRedemption(user.id),
    getEarnActions(user.id),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PointsHub
        balance={balance}
        pendingRedemption={pendingRedemption}
        earnActions={earnActions}
        ledger={ledger}
      />
    </div>
  )
}
