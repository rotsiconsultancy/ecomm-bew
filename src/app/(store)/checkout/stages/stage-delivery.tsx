'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCheckout } from '../checkout-context'

type FieldKey = 'full_name' | 'phone' | 'county' | 'town' | 'street'

const FIELDS: { key: FieldKey; label: string; placeholder: string }[] = [
  { key: 'full_name', label: "What's your name?", placeholder: 'Full name' },
  { key: 'phone', label: 'Phone number for delivery updates', placeholder: '+254 7XX XXX XXX' },
  { key: 'county', label: 'Which county?', placeholder: 'e.g. Nairobi' },
  { key: 'town', label: 'Town or area', placeholder: 'e.g. Westlands' },
  { key: 'street', label: 'Street address / building', placeholder: 'e.g. Muthangari Drive, Apt 4B' },
]

export function StageDelivery() {
  const { goNext, userCheckout, state, setDelivery, deliveryFee } = useCheckout()
  const lastAddr = userCheckout.last_shipping_address

  // If user has a saved address, show confirmation card first
  const [usingSaved, setUsingSaved] = useState<boolean | null>(
    lastAddr ? null : false // null = showing saved address card, false = show fields
  )

  // One-field-at-a-time: which field is currently active
  const [activeField, setActiveField] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [delivery, setLocalDelivery] = useState(state.delivery)

  // Prefill from profile
  useEffect(() => {
    if (!delivery.full_name && userCheckout.full_name) {
      setLocalDelivery((d) => ({ ...d, full_name: userCheckout.full_name }))
    }
    if (!delivery.phone && userCheckout.phone) {
      setLocalDelivery((d) => ({ ...d, phone: userCheckout.phone }))
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prefill from last order address
  useEffect(() => {
    if (lastAddr && usingSaved === false && !delivery.county) {
      setLocalDelivery((d) => ({
        ...d,
        full_name: d.full_name || lastAddr.full_name || '',
        phone: d.phone || lastAddr.phone || '',
        county: lastAddr.county || lastAddr.city || '',
        town: lastAddr.town || '',
        street: lastAddr.street || lastAddr.delivery_address || '',
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingSaved])

  // Auto-focus current field
  useEffect(() => {
    if (usingSaved === false) {
      inputRef.current?.focus()
    }
  }, [activeField, usingSaved])

  function handleFieldSubmit() {
    if (activeField < FIELDS.length - 1) {
      setActiveField(activeField + 1)
    } else {
      // All fields done — proceed
      handleContinue()
    }
  }

  function handleContinue() {
    setDelivery(delivery)
    goNext()
  }

  function handleUseSaved() {
    if (!lastAddr) return
    const d = {
      full_name: lastAddr.full_name || userCheckout.full_name,
      phone: lastAddr.phone || userCheckout.phone,
      county: lastAddr.county || lastAddr.city || '',
      town: lastAddr.town || '',
      street: lastAddr.street || lastAddr.delivery_address || '',
    }
    setLocalDelivery(d)
    setDelivery(d)
    goNext()
  }

  // Show saved address confirmation card
  if (usingSaved === null && lastAddr) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="h-16 w-16 bg-[#003366]/10 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="h-8 w-8 text-[#003366]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#003366]">Deliver here?</h2>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-2">
          <p className="font-bold text-[#003366]">{lastAddr.full_name}</p>
          <p className="text-sm text-gray-500">{lastAddr.phone}</p>
          <p className="text-sm text-gray-500">
            {lastAddr.street || lastAddr.delivery_address}
          </p>
          <p className="text-sm text-gray-500">
            {[lastAddr.town, lastAddr.county || lastAddr.city].filter(Boolean).join(', ')}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleUseSaved}
            className="flex-1 h-14 bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-base font-extrabold rounded-2xl"
          >
            <Check className="w-5 h-5 mr-2" />
            Yes, deliver here
          </Button>
          <Button
            variant="outline"
            onClick={() => setUsingSaved(false)}
            className="h-14 px-6 rounded-2xl font-bold text-[#003366] border-gray-200"
          >
            Change
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Delivery fee: KES {deliveryFee.toLocaleString()}
        </p>
      </div>
    )
  }

  // One-field-at-a-time form
  const currentField = FIELDS[activeField]
  const allFilled = FIELDS.every((f) => delivery[f.key]?.trim())

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Field progress indicator */}
      <div className="flex gap-1.5">
        {FIELDS.map((f, i) => (
          <div
            key={f.key}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= activeField ? 'bg-[#ec5b13]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Current field */}
      <div
        key={currentField.key}
        className="animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-3"
      >
        <h2 className="text-2xl font-extrabold text-[#003366]">
          {currentField.label}
        </h2>
        <Input
          ref={inputRef}
          value={delivery[currentField.key]}
          onChange={(e) =>
            setLocalDelivery((d) => ({ ...d, [currentField.key]: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' && delivery[currentField.key]?.trim()) {
              e.preventDefault()
              handleFieldSubmit()
            }
          }}
          placeholder={currentField.placeholder}
          className="h-14 text-lg rounded-xl border-gray-200 focus-visible:ring-[#ec5b13]"
          autoFocus
        />
      </div>

      {/* Completed fields summary */}
      {activeField > 0 && (
        <div className="space-y-2">
          {FIELDS.slice(0, activeField).map((f, i) => (
            <button
              key={f.key}
              onClick={() => setActiveField(i)}
              className="w-full text-left flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-xs text-gray-400 w-16 shrink-0">{f.key === 'full_name' ? 'Name' : f.key === 'phone' ? 'Phone' : f.key === 'county' ? 'County' : f.key === 'town' ? 'Town' : 'Street'}</span>
              <span className="text-sm font-semibold text-[#003366] truncate">{delivery[f.key]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {activeField < FIELDS.length - 1 ? (
          <Button
            onClick={handleFieldSubmit}
            disabled={!delivery[currentField.key]?.trim()}
            className="flex-1 h-14 bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-base font-extrabold rounded-2xl disabled:opacity-40"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            disabled={!allFilled}
            className="flex-1 h-14 bg-[#ec5b13] hover:bg-[#d14d0d] text-white text-base font-extrabold rounded-2xl disabled:opacity-40"
          >
            Continue
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Delivery fee: KES {deliveryFee.toLocaleString()}
      </p>
    </div>
  )
}
