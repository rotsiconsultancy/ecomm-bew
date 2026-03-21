'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Star, Camera, Bell, MessageSquare, Users,
  Check, Loader2, PartyPopper, ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { claimPointsAction } from '@/app/(store)/account/points/actions'
import type { PostPurchasePrompt } from '@/types/checkout'

const PROMPT_ICONS: Record<string, React.ReactNode> = {
  share_photo: <Camera className="w-5 h-5" />,
  notif_monday: <Bell className="w-5 h-5" />,
  notif_price_alert: <Bell className="w-5 h-5" />,
  notif_new_sku: <Bell className="w-5 h-5" />,
  review_reminder: <MessageSquare className="w-5 h-5" />,
  referral: <Users className="w-5 h-5" />,
}

interface Props {
  orderId: string
  pointsBalance: number
  prompts: PostPurchasePrompt[]
  userId: string
}

export function SuccessView({ orderId, pointsBalance, prompts, userId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [claimed, setClaimed] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Only show immediate prompts
  const visiblePrompts = prompts.filter(
    (p) => p.trigger_timing === 'immediate' && !dismissed.has(p.prompt_key)
  )

  function handleClaim(promptKey: string) {
    startTransition(async () => {
      // For notification prompts, claim the subscribe points
      await claimPointsAction('subscribe', `post_purchase_${promptKey}_${orderId}`)
      setClaimed((prev) => new Set(prev).add(promptKey))
    })
  }

  function handleDismiss(promptKey: string) {
    setDismissed((prev) => new Set(prev).add(promptKey))
  }

  return (
    <div className="space-y-8">
      {/* Celebration header */}
      <div className="text-center space-y-4">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <h1 className="text-3xl font-extrabold text-[#003366]">Order placed!</h1>
          <p className="text-gray-400 mt-1">
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Points balance card */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
        <div className="bg-linear-to-br from-[#003366] to-[#004a8f] rounded-2xl p-6 text-white text-center">
          <Star className="h-8 w-8 text-[#ec5b13] mx-auto mb-2" />
          <p className="text-3xl font-extrabold">{pointsBalance.toLocaleString()}</p>
          <p className="text-sm text-white/60">points in your account</p>
        </div>
      </div>

      {/* Post-purchase prompt cards */}
      {visiblePrompts.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700 fill-mode-both">
          <h2 className="text-lg font-bold text-[#003366] text-center">
            Earn more points
          </h2>
          {visiblePrompts.map((prompt) => {
            const isClaimed = claimed.has(prompt.prompt_key)
            return (
              <div
                key={prompt.prompt_key}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                  isClaimed ? 'border-green-300 bg-green-50/50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      isClaimed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-[#ec5b13]/10 text-[#ec5b13]'
                    }`}
                  >
                    {isClaimed ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      PROMPT_ICONS[prompt.prompt_key] ?? <Star className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#003366]">{prompt.copy_text}</p>
                    <Badge className="mt-1.5 bg-[#ec5b13]/10 text-[#ec5b13] border-none text-xs font-bold">
                      +{prompt.points_value} pts
                    </Badge>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    {isClaimed ? (
                      <span className="text-xs font-bold text-green-600">Opted in ✓</span>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleClaim(prompt.prompt_key)}
                          className="bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-xs font-bold h-8 px-3 rounded-lg"
                        >
                          {isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : prompt.prompt_key === 'share_photo' ? (
                            'Remind me'
                          ) : prompt.prompt_key === 'referral' ? (
                            'Get link'
                          ) : (
                            'Opt in'
                          )}
                        </Button>
                        <button
                          onClick={() => handleDismiss(prompt.prompt_key)}
                          className="text-[10px] text-gray-300 hover:text-gray-400"
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link href={`/order-details?id=${orderId}`} className="flex-1">
          <Button
            variant="outline"
            className="w-full h-12 font-bold text-[#003366] border-gray-200 rounded-2xl"
          >
            View my order
          </Button>
        </Link>
        <Link href="/products" className="flex-1">
          <Button className="w-full h-12 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-bold rounded-2xl">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Keep shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}
