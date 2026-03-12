import { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'
import { getPublicSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Contact Us | Bewama',
  description:
    'Get in touch with the Bewama team — email, phone, or visit our office. We respond to all enquiries within 24 hours.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const site = await getPublicSiteSettings()

  const email = site.contact_email || 'info@bewama.com'
  const phone = site.contact_phone || null
  const address = site.address || null
  const hours = site.business_hours || 'Mon – Fri, 8:00 AM – 5:00 PM (EAT)'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm text-gray-400 mb-2">Get in Touch</p>
        <h1 className="text-4xl font-extrabold text-[#003366]">Contact Us</h1>
        <p className="text-gray-500 mt-3 max-w-xl">
          Have a question, need a quote, or want to discuss a bulk order? Reach out — our team responds within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Contact Cards */}
        <div className="lg:col-span-2 space-y-5">
          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#ec5b13]/30 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#003366]/5 flex items-center justify-center shrink-0 group-hover:bg-[#ec5b13]/10 transition-colors">
              <Mail className="w-5 h-5 text-[#003366] group-hover:text-[#ec5b13] transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Email</p>
              <p className="text-sm text-[#ec5b13] mt-0.5">{email}</p>
            </div>
          </a>

          {/* Phone */}
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#ec5b13]/30 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#003366]/5 flex items-center justify-center shrink-0 group-hover:bg-[#ec5b13]/10 transition-colors">
                <Phone className="w-5 h-5 text-[#003366] group-hover:text-[#ec5b13] transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Phone</p>
                <p className="text-sm text-gray-500 mt-0.5">{phone}</p>
              </div>
            </a>
          )}

          {/* Address */}
          {address && (
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#003366]/5 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#003366]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Office</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{address}</p>
              </div>
            </div>
          )}

          {/* Business Hours */}
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white">
            <div className="w-10 h-10 rounded-xl bg-[#003366]/5 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#003366]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Business Hours</p>
              <p className="text-sm text-gray-500 mt-0.5">{hours}</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <form
            action={`mailto:${email}`}
            method="GET"
            className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <h2 className="text-lg font-bold text-[#003366]">Send us a message</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+254 7XX XXX XXX"
                className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                placeholder="Bulk order enquiry"
                className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                id="body"
                name="body"
                required
                rows={5}
                placeholder="Tell us how we can help..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Send Message
            </button>

            <p className="text-xs text-gray-400 text-center">
              This opens your email client with a pre-filled message. For bulk orders,{' '}
              <Link href="/request-quote" className="text-[#ec5b13] underline">
                request a quote
              </Link>{' '}
              instead.
            </p>
          </form>
        </div>
      </div>

      {/* Quick links CTA */}
      <div className="mt-14 bg-[#003366] text-white rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Need something specific?</h3>
        <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
          For product enquiries, quotes, or order support — use one of these shortcuts.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/request-quote"
            className="inline-flex items-center gap-2 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Request a Quote <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Browse FAQ
          </Link>
        </div>
      </div>

      {/* Related links */}
      <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/faq" className="hover:text-[#003366] transition-colors">FAQ</Link>
        <Link href="/shipping-policy" className="hover:text-[#003366] transition-colors">Shipping Policy</Link>
        <Link href="/returns-policy" className="hover:text-[#003366] transition-colors">Returns &amp; Refunds</Link>
        <Link href="/quality-assurance" className="hover:text-[#003366] transition-colors">Quality Assurance</Link>
      </div>
    </div>
  )
}
