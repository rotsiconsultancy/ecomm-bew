'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, CheckCircle2, Phone, Mail, MapPin, UserCircle2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createQuote } from './actions'
import Link from 'next/link'

interface QuoteItem {
  product_name: string
  quantity: number
  unit: string
}

interface Props {
  product: string
  prefill: { fullName: string; email: string; phone: string; company: string } | null
  contact: { phone: string; email: string; address: string }
  isLoggedIn: boolean
  userName: string | null
}

export function QuoteForm({ product, prefill, contact, isLoggedIn, userName }: Props) {
  const router = useRouter()

  const [fullName, setFullName] = useState(prefill?.fullName ?? '')
  const [email, setEmail]       = useState(prefill?.email ?? '')
  const [phone, setPhone]       = useState(prefill?.phone ?? '')
  const [company, setCompany]   = useState(prefill?.company ?? '')
  const [message, setMessage]   = useState('')
  const [items, setItems]       = useState<QuoteItem[]>([
    { product_name: product, quantity: 1, unit: 'units' },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-[#003366] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#003366] transition-colors">Products</Link>
        <span>/</span>
        <span className="text-[#003366] font-medium">Request a Quote</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">

        {/* ── Form Column ─────────────────────────────────────────────── */}
        <div className="lg:flex-1 space-y-6">

          {/* Page title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#003366] rounded-xl flex items-center justify-center shrink-0 mt-1">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#003366]">Request a Quote</h1>
              <p className="text-gray-500 mt-1 text-base">
                For bulk orders or custom pricing — we respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Logged-in prefill notice */}
          {isLoggedIn && prefill && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3">
              <UserCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>
                Signed in as <strong>{userName ?? email}</strong> — contact fields pre-filled from your account.
              </span>
            </div>
          )}

          {/* Guest nudge */}
          {!isLoggedIn && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3">
              <UserCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <Link href={`/login?redirectTo=/request-quote${product ? `?product=${encodeURIComponent(product)}` : ''}`} className="font-semibold underline underline-offset-2 hover:text-blue-900">Sign in</Link>{' '}
                to auto-fill your contact details and track this quote in your account.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* ── Section 1: Contact Info ─────────────────────────── */}
            <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#003366] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <h2 className="font-bold text-[#003366]">Contact Information</h2>
              </div>

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
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white"
                    readOnly={isLoggedIn && !!prefill?.fullName}
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
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white"
                    readOnly={isLoggedIn && !!prefill?.email}
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
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp Ltd"
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white"
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
                  placeholder="Describe what you need — quantities, timeline, delivery location, special requirements…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white placeholder:text-gray-400"
                />
              </div>
            </Card>

            {/* ── Section 2: Products ─────────────────────────────── */}
            <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#003366] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <h2 className="font-bold text-[#003366]">Products Required</h2>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={item.product_name}
                      onChange={(e) => updateItem(idx, 'product_name', e.target.value)}
                      placeholder="Product name or description"
                      className="h-10 flex-1 bg-gray-50 border-gray-200 focus:bg-white"
                    />
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="h-10 w-20 text-center bg-gray-50 border-gray-200 focus:bg-white"
                      placeholder="Qty"
                    />
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                      placeholder="units"
                      className="h-10 w-24 bg-gray-50 border-gray-200 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      title="Remove item"
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
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

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-extrabold text-base rounded-xl shadow-md active:scale-[0.99] transition-all"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting…</>
              ) : (
                'Submit Quote Request'
              )}
            </Button>

            <p className="text-xs text-gray-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              Your data is securely stored and never shared with third parties.
            </p>
          </form>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-80 xl:w-96 space-y-6 lg:pt-16">

          {/* Why Bewama */}
          <div className="bg-[#003366] text-white p-7 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-5">Why Choose Bewama?</h3>
            <div className="space-y-5">
              {[
                { n: '01', title: 'Competitive Wholesale Rates', desc: 'Direct from manufacturer pricing for bulk orders.' },
                { n: '02', title: 'Global Logistics Support',    desc: 'Managing shipping, customs, and delivery door-to-door.' },
                { n: '03', title: 'Dedicated Account Manager',   desc: 'One point of contact for all your industrial needs.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-3.5">
                  <div className="w-9 h-9 bg-[#ec5b13]/20 rounded-full flex items-center justify-center text-[#ec5b13] font-bold text-xs shrink-0">
                    {n}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Contact */}
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-lg font-bold text-[#003366] mb-5">Direct Contact</h4>
            <div className="space-y-4">
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3.5 text-gray-600 hover:text-[#003366] transition-colors group">
                  <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                    <Phone className="h-4 w-4 text-[#ec5b13]" />
                  </div>
                  <span className="text-sm font-medium">{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3.5 text-gray-600 hover:text-[#003366] transition-colors group">
                  <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                    <Mail className="h-4 w-4 text-[#ec5b13]" />
                  </div>
                  <span className="text-sm font-medium">{contact.email}</span>
                </a>
              )}
              {contact.address && (
                <div className="flex items-start gap-3.5 text-gray-600">
                  <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-[#ec5b13]" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Response time badge */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">We respond within 24 hours</p>
              <p className="text-xs text-green-600 mt-0.5">Mon–Fri during business hours</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
