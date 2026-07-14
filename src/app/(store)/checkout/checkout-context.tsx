'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type {
  CheckoutStage,
  CheckoutState,
  DeliveryDetails,
  PaymentMethodKey,
  CompanionProduct,
  InfluenceConfig,
  PaymentMethod,
  PostPurchasePrompt,
  UserCheckoutData,
} from '@/types/checkout'
import { DEFAULT_CHECKOUT_STATE, DEFAULT_DELIVERY } from '@/types/checkout'
import type { CartItem } from '@/lib/cart-store'
import type { DeliveryRegion } from '@/types/supplier'

const STORAGE_KEY = 'bewama_checkout_state'

interface CheckoutContextValue {
  // State
  state: CheckoutState
  stage: CheckoutStage

  // Navigation
  goTo: (stage: CheckoutStage) => void
  goNext: () => void
  goBack: () => void

  // Data setters
  setDelivery: (d: DeliveryDetails) => void
  setPayment: (key: PaymentMethodKey) => void
  addCompanion: (productId: string) => void
  setPointsApplied: (applied: boolean) => void
  setOrderId: (id: string) => void
  reset: () => void

  // Server data (passed as props)
  cartItems: CartItem[]
  cartTotal: number
  userCheckout: UserCheckoutData
  influenceConfig: InfluenceConfig
  companions: CompanionProduct[]
  paymentMethods: PaymentMethod[]
  postPurchasePrompts: PostPurchasePrompt[]
  deliveryFee: number
  earnRate: number // points per KES 50 spent
  deliveryRegions: DeliveryRegion[]
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider')
  return ctx
}

interface ProviderProps {
  children: ReactNode
  cartItems: CartItem[]
  cartTotal: number
  userCheckout: UserCheckoutData
  influenceConfig: InfluenceConfig
  companions: CompanionProduct[]
  paymentMethods: PaymentMethod[]
  postPurchasePrompts: PostPurchasePrompt[]
  deliveryFee: number
  earnRate: number
  deliveryRegions: DeliveryRegion[]
}

export function CheckoutProvider({
  children,
  cartItems,
  cartTotal,
  userCheckout,
  influenceConfig,
  companions,
  paymentMethods,
  postPurchasePrompts,
  deliveryFee,
  earnRate,
  deliveryRegions,
}: ProviderProps) {
  const [state, setState] = useState<CheckoutState>(() => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as CheckoutState
          // Don't restore past stage 5 — that's post-purchase
          if (parsed.stage <= 5) return parsed
        }
      } catch {
        // Ignore parse errors
      }
    }
    return {
      ...DEFAULT_CHECKOUT_STATE,
      delivery: {
        ...DEFAULT_DELIVERY,
        full_name: userCheckout.full_name,
        phone: userCheckout.phone,
      },
      pointsRedeemApplied: userCheckout.pending_redemption > 0,
    }
  })

  // Persist state to localStorage
  useEffect(() => {
    if (state.stage <= 5) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state])

  const goTo = useCallback((stage: CheckoutStage) => {
    setState((s) => ({ ...s, stage }))
  }, [])

  const goNext = useCallback(() => {
    setState((s) => {
      const next = Math.min(s.stage + 1, 6) as CheckoutStage
      return { ...s, stage: next }
    })
  }, [])

  const goBack = useCallback(() => {
    setState((s) => {
      const prev = Math.max(s.stage - 1, 1) as CheckoutStage
      return { ...s, stage: prev }
    })
  }, [])

  const setDelivery = useCallback((d: DeliveryDetails) => {
    setState((s) => ({ ...s, delivery: d }))
  }, [])

  const setPayment = useCallback((key: PaymentMethodKey) => {
    setState((s) => ({ ...s, selectedPayment: key }))
  }, [])

  const addCompanion = useCallback((productId: string) => {
    setState((s) => ({
      ...s,
      addedCompanions: s.addedCompanions.includes(productId)
        ? s.addedCompanions
        : [...s.addedCompanions, productId],
    }))
  }, [])

  const setPointsApplied = useCallback((applied: boolean) => {
    setState((s) => ({ ...s, pointsRedeemApplied: applied }))
  }, [])

  const setOrderId = useCallback((id: string) => {
    setState((s) => ({ ...s, orderId: id, stage: 6 as CheckoutStage }))
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const reset = useCallback(() => {
    setState(DEFAULT_CHECKOUT_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <CheckoutContext.Provider
      value={{
        state,
        stage: state.stage,
        goTo,
        goNext,
        goBack,
        setDelivery,
        setPayment,
        addCompanion,
        setPointsApplied,
        setOrderId,
        reset,
        cartItems,
        cartTotal,
        userCheckout,
        influenceConfig,
        companions,
        paymentMethods,
        postPurchasePrompts,
        deliveryFee,
        earnRate,
        deliveryRegions,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}
