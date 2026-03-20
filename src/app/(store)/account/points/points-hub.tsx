'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Star, CheckCircle2, Lock, Gift, ArrowUp, ArrowDown,
  Loader2, ChevronRight, AlertCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { claimPointsAction, redeemPointsAction } from './actions'
import type { EarnAction, LedgerEntry } from '@/types/points'
import { POINTS_TO_KES } from '@/types/points'

interface Props {
  balance: number
  pendingRedemption: number
  earnActions: EarnAction[]
  ledger: LedgerEntry[]
}

export function PointsHub({ balance, pendingRedemption, earnActions, ledger }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [claimingKey, setClaimingKey] = useState<string | null>(null)
  const [redeemInput, setRedeemInput] = useState('')
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null)
  const [claimFeedback, setClaimFeedback] = useState<Record<string, string>>({})

  const available = balance - pendingRedemption
  const kesValue = available * POINTS_TO_KES
  const nextMilestone = Math.ceil(balance / 1000) * 1000 || 1000
  const progress = Math.min((balance / nextMilestone) * 100, 100)
  const toNext = nextMilestone - balance

  function handleClaim(actionKey: string, referenceId?: string) {
    const feedbackKey = `${actionKey}::${referenceId ?? ''}`
    setClaimingKey(feedbackKey)
    setClaimFeedback((prev) => ({ ...prev, [feedbackKey]: '' }))

    startTransition(async () => {
      const result = await claimPointsAction(actionKey, referenceId)
      if (result.success) {
        setClaimFeedback((prev) => ({
          ...prev,
          [feedbackKey]: `+${result.points_awarded} pts`,
        }))
      } else {
        setClaimFeedback((prev) => ({
          ...prev,
          [feedbackKey]: result.error ?? 'Failed',
        }))
      }
      setClaimingKey(null)
      router.refresh()
    })
  }

  function handleRedeem() {
    const pts = parseInt(redeemInput, 10)
    if (!pts || pts <= 0) {
      setRedeemError('Enter a valid number of points')
      return
    }
    setRedeemError(null)
    setRedeemSuccess(null)

    startTransition(async () => {
      const result = await redeemPointsAction(pts)
      if (result.success) {
        setRedeemSuccess(
          `Redeemed ${pts} pts for KES ${result.kes_discount?.toFixed(2)} discount. Apply at checkout.`
        )
        setRedeemInput('')
      } else {
        setRedeemError(result.error ?? 'Redemption failed')
      }
      router.refresh()
    })
  }

  const redeemPreview = parseInt(redeemInput, 10) > 0
    ? (parseInt(redeemInput, 10) * POINTS_TO_KES).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-[#ec5b13]/10 rounded-full flex items-center justify-center">
          <Star className="h-6 w-6 text-[#ec5b13]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#003366]">Bewama Points</h1>
          <p className="text-sm text-gray-400">Earn points, unlock discounts</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="rounded-2xl border-none shadow-sm p-8 bg-linear-to-br from-[#003366] to-[#004a8f] text-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Your Balance</p>
            <p className="text-5xl font-extrabold mt-1">
              {available.toLocaleString()}
              <span className="text-lg font-bold text-white/50 ml-2">pts</span>
            </p>
            <p className="text-sm text-white/70 mt-1">
              ≈ KES {kesValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
            {pendingRedemption > 0 && (
              <p className="text-xs text-amber-300 mt-1">
                {pendingRedemption.toLocaleString()} pts pending redemption at checkout
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              Next milestone: {nextMilestone.toLocaleString()} pts
            </p>
            <div className="w-full sm:w-56 h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ec5b13] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-white/50 mt-1">{toNext.toLocaleString()} pts to go</p>
          </div>
        </div>
      </Card>

      {/* Earn Points Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#003366] flex items-center gap-2">
          <Gift className="h-5 w-5 text-[#ec5b13]" />
          Earn Points
        </h2>

        <div className="space-y-3">
          {earnActions.map((action, i) => {
            const feedbackKey = `${action.action_key}::${action.reference_id ?? ''}`
            const feedback = claimFeedback[feedbackKey]
            const isLoading = claimingKey === feedbackKey && isPending

            return (
              <Card
                key={`${action.action_key}-${action.reference_id ?? i}`}
                className={`rounded-xl border-none shadow-sm p-4 flex items-center gap-4 transition-all ${
                  action.status === 'locked' ? 'opacity-60' : ''
                }`}
              >
                {/* Status icon */}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  action.status === 'claimed'
                    ? 'bg-green-100 text-green-600'
                    : action.status === 'available'
                      ? 'bg-[#ec5b13]/10 text-[#ec5b13]'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {action.status === 'claimed' && <CheckCircle2 className="h-5 w-5" />}
                  {action.status === 'available' && <Star className="h-5 w-5" />}
                  {action.status === 'locked' && <Lock className="h-5 w-5" />}
                </div>

                {/* Action info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#003366]">{action.label}</p>
                  {action.description && (
                    <p className="text-xs text-gray-400 truncate">{action.description}</p>
                  )}
                </div>

                {/* Points value */}
                <div className="text-right shrink-0">
                  <Badge
                    variant="secondary"
                    className={`font-bold ${
                      action.status === 'claimed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[#003366]/10 text-[#003366]'
                    }`}
                  >
                    +{action.points_value} pts
                  </Badge>
                </div>

                {/* Action button / status */}
                <div className="shrink-0 w-24 text-right">
                  {action.status === 'claimed' && (
                    <span className="text-xs font-bold text-green-600">Claimed</span>
                  )}
                  {action.status === 'locked' && (
                    <span className="text-xs font-bold text-gray-400">Locked</span>
                  )}
                  {action.status === 'available' && (
                    <Button
                      size="sm"
                      disabled={isLoading || isPending}
                      onClick={() => handleClaim(action.action_key, action.reference_id)}
                      className="bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-xs font-bold h-8 px-3"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Claim'
                      )}
                    </Button>
                  )}
                </div>

                {/* Feedback toast */}
                {feedback && (
                  <span className={`text-xs font-bold shrink-0 ${
                    feedback.startsWith('+') ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {feedback}
                  </span>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Redeem Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#003366] flex items-center gap-2">
          <ArrowDown className="h-5 w-5 text-[#ec5b13]" />
          Redeem Points
        </h2>

        <Card className="rounded-xl border-none shadow-sm p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Convert points to a discount applied at checkout. 1 point = KES {POINTS_TO_KES.toFixed(2)}
          </p>

          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Points to redeem</label>
              <Input
                type="number"
                min={1}
                max={available}
                value={redeemInput}
                onChange={(e) => {
                  setRedeemInput(e.target.value)
                  setRedeemError(null)
                  setRedeemSuccess(null)
                }}
                placeholder={`Up to ${available.toLocaleString()}`}
                className="h-11"
              />
            </div>
            <div className="text-center px-4">
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Discount value</label>
              <div className="h-11 px-3 border border-input rounded-md flex items-center bg-gray-50 text-[#003366] font-bold">
                KES {redeemPreview}
              </div>
            </div>
          </div>

          <Button
            disabled={isPending || !redeemInput || parseInt(redeemInput, 10) <= 0}
            onClick={handleRedeem}
            className="bg-[#003366] hover:bg-[#002244] text-white font-bold"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Redeem Points
          </Button>

          {redeemError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {redeemError}
            </div>
          )}
          {redeemSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              {redeemSuccess}
            </div>
          )}
        </Card>
      </div>

      {/* Ledger Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#003366] flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-[#ec5b13]" />
          Recent Activity
        </h2>

        {ledger.length === 0 ? (
          <Card className="rounded-xl border-none shadow-sm p-8 text-center">
            <Star className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No point activity yet. Start earning above!</p>
          </Card>
        ) : (
          <Card className="rounded-xl border-none shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {ledger.map((entry) => (
                <div key={entry.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    entry.points >= 0
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {entry.points >= 0
                      ? <ArrowUp className="h-4 w-4" />
                      : <ArrowDown className="h-4 w-4" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#003366]">{entry.label}</p>
                    {entry.note && (
                      <p className="text-xs text-gray-400 truncate">{entry.note}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${
                      entry.points >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.points >= 0 ? '+' : ''}{entry.points}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  {entry.status === 'pending' && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      Pending
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
