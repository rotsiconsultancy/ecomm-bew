import { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/settings'
import Link from 'next/link'
import { RotateCcw, CheckCircle2, XCircle, Phone } from 'lucide-react'

const SITE_URL = 'https://bewama.com'

export const metadata: Metadata = {
  title: 'Returns & Refunds Policy | Bewama',
  description: 'Return eligibility, process, and refund timelines for Bewama orders. Most items returnable within 14 days.',
  alternates: { canonical: `${SITE_URL}/returns-policy` },
  openGraph: {
    title: 'Returns & Refunds Policy | Bewama',
    description: 'Return eligibility, process, and refund timelines for Bewama orders.',
    type: 'website',
    url: `${SITE_URL}/returns-policy`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary',
    title: 'Returns & Refunds Policy | Bewama',
    description: 'Return eligibility, process, and refund timelines for Bewama orders.',
  },
}

export default async function ReturnsPolicyPage() {
  const site = await getPublicSiteSettings()
  const email = site.contact_email || 'info@bewama.com'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-2">Support</p>
        <h1 className="text-4xl font-extrabold text-[#061f3f]">Returns &amp; Refunds</h1>
        <p className="text-gray-500 mt-3">Bewama Investments &nbsp;·&nbsp; Last updated January {new Date().getFullYear()}</p>
      </div>

      {/* Summary banner */}
      <div className="bg-[#061f3f] text-white rounded-2xl p-6 mb-10 flex gap-4">
        <RotateCcw className="w-8 h-8 text-[#ff5f14] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-lg">14-Day Return Window</p>
          <p className="text-gray-300 text-sm mt-1">
            Most unused items in original packaging can be returned within 14 calendar days of delivery.
            Refunds are processed within 7–14 business days.
          </p>
        </div>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">1. Return Eligibility</h2>
          <p>To qualify for a return, the following conditions must be met:</p>
          <div className="mt-4 space-y-2">
            {[
              'The return is requested within 14 calendar days of delivery.',
              'The item is unused, unaltered, and in its original packaging.',
              'The item is accompanied by the original order confirmation or proof of purchase.',
              'The item is not listed as non-returnable (see Section 2).',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">2. Non-Returnable Items</h2>
          <p>The following categories are <strong>not eligible</strong> for return:</p>
          <div className="mt-4 space-y-2">
            {[
              'Bulk chemicals or industrial liquids that have been opened, partially used, or tampered with.',
              'Custom-cut or custom-processed timber and materials.',
              'Products purchased on a quote basis that were manufactured or sourced specifically for your order.',
              'Perishable or hazardous goods where return would pose a safety risk.',
              'Items clearly stated as "final sale" at the time of purchase.',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5 text-sm">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">3. How to Initiate a Return</h2>
          <ol className="list-decimal pl-6 space-y-3 text-sm mt-2">
            <li>
              <strong>Contact us</strong> within 14 days of delivery at{' '}
              <a href={`mailto:${email}`} className="text-[#ff5f14] underline">{email}</a> or{' '}
              {site.contact_phone && <span>{site.contact_phone}</span>}. Include your order number, the item(s) you wish to return,
              and the reason for the return.
            </li>
            <li>
              <strong>Receive a Return Authorisation (RA)</strong> from our team. Returns sent without an RA may not be accepted.
            </li>
            <li>
              <strong>Pack the items securely</strong> in their original packaging and include a copy of your order confirmation.
            </li>
            <li>
              <strong>Return the items</strong> to our Nairobi warehouse (address provided with RA) or arrange collection
              for large/bulk items. Return shipping costs are at the customer&apos;s expense unless the return is due to our error
              or a defective product.
            </li>
            <li>
              <strong>Inspection:</strong> Once we receive the items, we will inspect them within <strong>3 business days</strong> and notify you of the outcome.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">4. Refunds</h2>
          <p>Upon approval of your return:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-sm">
            <li>Refunds are issued via the <strong>original payment method</strong> (M-Pesa, bank transfer, card, etc.).</li>
            <li>Processing time: <strong>7–14 business days</strong> from the date we confirm the return.</li>
            <li>Where applicable, original delivery fees are non-refundable unless the return is due to a Bewama error.</li>
            <li>Partial refunds may apply where items are returned with minor packaging damage.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">5. Damaged or Defective Goods</h2>
          <p>
            If your order arrives damaged, defective, or incorrect, please notify us within <strong>48 hours</strong> of delivery.
            Include photographs of the damage and the packaging. In these cases, Bewama will cover return shipping costs and
            either replace the item or issue a full refund, at your preference.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">6. Order Cancellations</h2>
          <p>
            Orders may be cancelled free of charge before they are dispatched. Once dispatched, the standard return process applies.
            To cancel, contact us immediately at <a href={`mailto:${email}`} className="text-[#ff5f14] underline">{email}</a> or{' '}
            {site.contact_phone || 'our contact number'}.
          </p>
          <p className="mt-3">
            Quote-based orders that have entered production or sourcing may incur a cancellation fee to cover committed costs.
            This will be communicated to you before the order is confirmed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">7. Contact Us</h2>
          <div className="mt-3 bg-gray-50 rounded-xl p-5 text-sm flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#ff5f14] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p><strong>Bewama Investments</strong></p>
              {site.address && <p>{site.address}</p>}
              <p>Email: <a href={`mailto:${email}`} className="text-[#ff5f14] underline">{email}</a></p>
              {site.contact_phone && <p>Phone: {site.contact_phone}</p>}
            </div>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/shipping-policy" className="hover:text-[#061f3f] transition-colors">Shipping Policy</Link>
        <Link href="/faq" className="hover:text-[#061f3f] transition-colors">FAQ</Link>
        <Link href="/terms" className="hover:text-[#061f3f] transition-colors">Terms &amp; Conditions</Link>
      </div>
    </div>
  )
}
