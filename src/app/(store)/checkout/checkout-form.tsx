'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package, Loader2, Smartphone, Truck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useCart } from '@/lib/cart-store'
import { createOrder } from './actions'

interface Props {
  userId: string
  defaultEmail: string
  defaultName: string
  defaultPhone: string
}

const DELIVERY_FEE = 500

export function CheckoutForm({ userId, defaultEmail, defaultName, defaultPhone }: Props) {
  const router = useRouter()
  const { cartItems, cartTotal, clearCart } = useCart()

  const [fullName, setFullName]               = useState(defaultName)
  const [phone, setPhone]                     = useState(defaultPhone)
  const [email]                               = useState(defaultEmail)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [city, setCity]                       = useState('')
  const [notes, setNotes]                     = useState('')
  const [loading, setLoading]                 = useState(false)
  const [mpesaMsg, setMpesaMsg]               = useState<string | null>(null)
  const [error, setError]                     = useState<string | null>(null)

  const subtotal = cartTotal
  const total    = subtotal + DELIVERY_FEE

  // Redirect to products if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      router.replace('/products')
    }
  }, [cartItems.length, loading, router])

  async function handleMpesa(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !phone || !deliveryAddress || !city) {
      setError('Please fill in all required fields.')
      return
    }
    setError(null)
    setLoading(true)

    // M-Pesa stub — show toast and create order
    setMpesaMsg('M-Pesa STK Push coming soon — your order is being placed...')

    const result = await createOrder(
      userId,
      cartItems.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        currency: i.currency,
        quantity: i.quantity,
        image: i.image,
      })),
      { full_name: fullName, phone, email, delivery_address: deliveryAddress, city, notes },
      total
    )

    if (!result.success) {
      setError(result.error ?? 'Failed to place order. Please try again.')
      setLoading(false)
      setMpesaMsg(null)
      return
    }

    clearCart()
    router.push(`/order-details?id=${result.id}`)
  }

  if (cartItems.length === 0) return null

  return (
    <form onSubmit={handleMpesa}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT — Order Summary */}
        <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
          <h2 className="font-bold text-[#003366] text-lg border-b pb-3">Order Summary</h2>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#003366] line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-[#003366] shrink-0">
                  KES {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-[#003366]">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className="font-semibold text-[#003366]">KES {DELIVERY_FEE.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#003366] pt-2 border-t">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* RIGHT — Delivery Details */}
        <div className="space-y-6">
          <Card className="p-6 rounded-2xl border-none shadow-sm space-y-5">
            <h2 className="font-bold text-[#003366] text-lg border-b pb-3">Delivery Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+254 7XX XXX XXX"
                  className="h-11"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <Input value={email} disabled className="h-11 bg-gray-50 text-gray-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  rows={2}
                  placeholder="Street, building, area..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Nairobi"
                  className="h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery instructions..."
                  className="h-11"
                />
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
            <h2 className="font-bold text-[#003366] text-lg border-b pb-3">Payment</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {mpesaMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                {mpesaMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 flex items-center justify-center gap-3 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-xl font-extrabold text-lg transition-all shadow-lg disabled:opacity-60 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  Pay KES {total.toLocaleString()} via M-Pesa
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">
              You will receive an M-Pesa prompt on your phone
            </p>

            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                Secure checkout
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Truck className="w-3.5 h-3.5 text-[#003366]" />
                Fast delivery
              </div>
            </div>
          </Card>

          <p className="text-xs text-gray-400 text-center">
            Want a quote instead?{' '}
            <Link href="/request-quote" className="text-[#ec5b13] hover:underline font-medium">
              Request a quote
            </Link>
          </p>
        </div>
      </div>
    </form>
  )
}
