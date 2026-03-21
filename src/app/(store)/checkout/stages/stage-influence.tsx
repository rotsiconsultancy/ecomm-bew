'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, Star, Flame, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCheckout } from '../checkout-context'
import { useCart } from '@/lib/cart-store'
import { POINTS_TO_KES } from '@/types/points'

export function StageInfluence() {
  const {
    goNext,
    influenceConfig,
    companions,
    userCheckout,
    addCompanion,
    state,
    earnRate,
  } = useCheckout()
  const { addToCart } = useCart()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set(state.addedCompanions))

  // Skip if influence off or no companions
  if (!influenceConfig.enabled || companions.length === 0) {
    // Auto-advance
    goNext()
    return null
  }

  const streakCount = userCheckout.streak_count

  // Group companions by reason_copy for headline
  const primaryReason = companions.find((c) => c.reason_copy)?.reason_copy

  function handleAdd(companion: typeof companions[0]) {
    addToCart({
      product_id: companion.id,
      name: companion.name,
      slug: companion.slug,
      price: companion.price,
      currency: companion.currency,
      quantity: 1,
      image: companion.image,
    })
    addCompanion(companion.id)
    setAddedIds((prev) => new Set(prev).add(companion.id))
  }

  // Calculate bundle savings if multiple added
  const addedCount = addedIds.size
  const bundlePointsBonus = addedCount >= 2 && influenceConfig.show_bundle_framing
    ? Math.floor(addedCount * 50 * earnRate)
    : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Headline */}
      <div className="text-center space-y-2">
        <div className="h-16 w-16 bg-[#ec5b13]/10 rounded-full flex items-center justify-center mx-auto">
          <Zap className="h-8 w-8 text-[#ec5b13]" />
        </div>
        {primaryReason ? (
          <h2 className="text-2xl font-extrabold text-[#003366] max-w-md mx-auto">
            {primaryReason}
          </h2>
        ) : (
          <h2 className="text-2xl font-extrabold text-[#003366]">
            Complete your project
          </h2>
        )}
        <p className="text-sm text-gray-400">
          Contractors who add these save time and earn more points
        </p>
      </div>

      {/* Streak reminder */}
      {influenceConfig.show_streak_reminder && streakCount > 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Flame className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm font-bold text-amber-700">
            You&apos;re on a {streakCount}-day streak — keep earning!
          </p>
        </div>
      )}

      {/* Companion cards */}
      <div className="space-y-3">
        {companions.map((companion) => {
          const isAdded = addedIds.has(companion.id)
          const companionPoints = Math.floor(companion.price / 50) * earnRate * companion.points_multiplier

          return (
            <div
              key={companion.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                isAdded ? 'border-green-400 bg-green-50/50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {companion.image ? (
                    <Image
                      src={companion.image}
                      alt={companion.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-200" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="font-bold text-[#003366] text-sm line-clamp-2">
                    {companion.name}
                  </p>
                  <p className="text-base font-extrabold text-[#003366]">
                    KES {companion.price.toLocaleString()}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {influenceConfig.show_points_overlay && companionPoints > 0 && (
                      <Badge className="bg-[#ec5b13]/10 text-[#ec5b13] border-none text-xs font-bold">
                        <Star className="w-3 h-3 mr-1" />
                        +{Math.floor(companionPoints)} pts
                      </Badge>
                    )}
                    {influenceConfig.show_scarcity && companion.stock > 0 && companion.stock < 20 && (
                      <Badge variant="outline" className="text-xs font-bold text-red-600 border-red-200">
                        {companion.stock} left
                      </Badge>
                    )}
                    {influenceConfig.show_social_proof && companion.orders_last_30_days > 5 && (
                      <Badge variant="outline" className="text-xs font-bold text-blue-600 border-blue-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {companion.orders_last_30_days} orders this month
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {isAdded ? (
                    <div className="text-xs font-bold text-green-600 bg-green-100 rounded-full px-3 py-1.5">
                      Added ✓
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAdd(companion)}
                      className="bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-xl h-9 px-4"
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bundle framing */}
      {influenceConfig.show_bundle_framing && bundlePointsBonus > 0 && (
        <div className="bg-linear-to-r from-[#003366] to-[#004a8f] rounded-2xl p-4 text-white text-center">
          <p className="font-bold">
            Bundle bonus: +{bundlePointsBonus} extra points
          </p>
          <p className="text-xs text-white/60">
            Worth KES {(bundlePointsBonus * POINTS_TO_KES).toFixed(2)} in discounts
          </p>
        </div>
      )}

      {/* Continue */}
      <div className="space-y-3">
        <Button
          onClick={goNext}
          className="w-full h-14 bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-lg font-extrabold rounded-2xl shadow-lg"
        >
          Continue
        </Button>
        {addedIds.size === 0 && (
          <button
            onClick={goNext}
            className="w-full text-center text-sm font-bold text-gray-400 hover:text-gray-500 transition-colors py-2"
          >
            Continue without adding
          </button>
        )}
      </div>
    </div>
  )
}
