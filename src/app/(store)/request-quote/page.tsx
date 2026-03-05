'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Trash2, Loader2, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createQuote } from './actions'

interface QuoteItem {
  product_name: string
  quantity: number
  unit: string
}

export default function RequestQuotePage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const productParam = searchParams.get('product') ?? ''

  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [company, setCompany]   = useState('')
  const [message, setMessage]   = useState('')
  const [items, setItems]       = useState<QuoteItem[]>([
    { product_name: productParam, quantity: 1, unit: 'units' },
  ])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function addItem() {
    setItems((prev) => [...prev, { product_name: '', quantity: 1, unit: 'units' }])
  }

  function removeItem(idx: number) {
    if (items.length === 1) return
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: keyof QuoteItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validItems = items.filter((i) => i.product_name.trim())
    if (validItems.length === 0) {
      setError('Please add at least one product item.')
      return
    }
    setError(null)
    setLoading(true)

    const result = await createQuote({ full_name: fullName, email, phone, company, message, items: validItems })
    if (!result.success) {
      setError(result.error ?? 'Failed to submit. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/quote-submitted?id=${result.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* Quote Form */}
        <div className="lg:flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-[#003366] mb-3">Request a Quote</h1>
            <p className="text-gray-500 text-lg max-w-2xl">
              For bulk orders or custom pricing, fill in the form below and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Contact Info */}
            <Card className="p-6 rounded-2xl border-none shadow-sm space-y-5">
              <h2 className="font-bold text-[#003366] text-lg border-b pb-3">Contact Information</h2>

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
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company (optional)
                  </label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp Ltd"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe what you need, timeline, special requirements..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
              <h2 className="font-bold text-[#003366] text-lg border-b pb-3">Products Required</h2>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Input
                        value={item.product_name}
                        onChange={(e) => updateItem(idx, 'product_name', e.target.value)}
                        placeholder="Product name or description"
                        className="h-10"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-10 text-center"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        placeholder="units"
                        className="h-10"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-semibold text-[#003366] hover:text-[#ec5b13] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </Card>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-extrabold text-lg rounded-xl shadow-lg active:scale-95 transition-all"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting…</>
              ) : (
                'Submit Quote Request'
              )}
            </Button>

            <p className="text-xs text-gray-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              Your data is securely stored according to our Privacy Policy.
            </p>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-96 space-y-8">
          <div className="bg-[#003366] text-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-6">Why Choose Bewama?</h3>
            <div className="space-y-6">
              {[
                { n: '01', title: 'Competitive Wholesale Rates', desc: 'Direct from manufacturer pricing for bulk orders.' },
                { n: '02', title: 'Global Logistics Support', desc: 'Managing shipping, customs, and delivery door-to-door.' },
                { n: '03', title: 'Dedicated Account Manager', desc: 'One point of contact for all your industrial needs.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <div className="h-10 w-10 bg-[#ec5b13]/20 rounded-full flex items-center justify-center text-[#ec5b13] font-bold text-sm shrink-0">
                    {n}
                  </div>
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="text-sm text-gray-300 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="text-xl font-bold text-[#003366] mb-6">Direct Contact</h4>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-[#ec5b13] shrink-0" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-[#ec5b13] shrink-0" />
                <span>sales@bewama.com</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-[#ec5b13] shrink-0" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
