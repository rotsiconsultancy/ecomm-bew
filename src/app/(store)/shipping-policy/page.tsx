import { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/settings'
import Link from 'next/link'
import { Truck, MapPin, Clock, Package, Phone } from 'lucide-react'

const SITE_URL = 'https://bewama.com'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Bewama',
  description: 'Delivery areas, timelines, costs, and shipping options for Bewama orders across Nairobi and Kenya.',
  alternates: { canonical: `${SITE_URL}/shipping-policy` },
  openGraph: {
    title: 'Shipping & Delivery Policy | Bewama',
    description: 'Delivery areas, timelines, costs, and shipping options for Bewama orders.',
    type: 'website',
    url: `${SITE_URL}/shipping-policy`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary',
    title: 'Shipping & Delivery Policy | Bewama',
    description: 'Delivery areas, timelines, costs, and shipping options for Bewama orders.',
  },
}

export default async function ShippingPolicyPage() {
  const site = await getPublicSiteSettings()
  const email = site.contact_email || 'info@bewama.com'

  const highlights = [
    { icon: MapPin,  title: 'Nairobi &amp; Environs', desc: 'Standard delivery 2–5 business days' },
    { icon: Truck,   title: 'Rest of Kenya',          desc: 'By arrangement — 5–10 business days' },
    { icon: Package, title: 'Self Pickup',             desc: 'Collect from our Nairobi warehouse' },
    { icon: Clock,   title: 'Bulk / Truck Delivery',  desc: 'Coordinated with you before dispatch' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-2">Support</p>
        <h1 className="text-4xl font-extrabold text-[#003366]">Shipping Policy</h1>
        <p className="text-gray-500 mt-3">Bewama Investments &nbsp;·&nbsp; Last updated January {new Date().getFullYear()}</p>
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        {highlights.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-3">
            <div className="w-9 h-9 bg-[#003366]/10 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#003366]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#003366]" dangerouslySetInnerHTML={{ __html: title }} />
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">1. Delivery Areas</h2>
          <p>
            We deliver to addresses within <strong>Nairobi and the surrounding metropolitan area</strong> as a standard service.
            Deliveries to other counties and regions in Kenya are available on request and are subject to confirmation of logistics and cost.
          </p>
          <p className="mt-3">
            For <strong>international or export orders</strong> (including European markets), please submit a{' '}
            <Link href="/request-quote" className="text-[#ec5b13] underline">Quote Request</Link>. Our team will confirm
            shipping terms, incoterms, and freight costs on a case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">2. Delivery Options</h2>

          <div className="space-y-5 mt-2">
            <div>
              <h3 className="font-semibold text-gray-800">a) Standard Delivery (Pickup Mtaani)</h3>
              <p className="mt-1 text-sm">
                Available for standard-sized orders. Parcels are delivered to your nearest Pickup Mtaani agent location or
                directly to your door. Estimated delivery: <strong>2–5 business days</strong> within Nairobi.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">b) Self Pickup</h3>
              <p className="mt-1 text-sm">
                You may collect your order directly from our Nairobi warehouse at no delivery cost. We will contact you by phone
                when your order is ready for collection. Please bring your order confirmation.
                {site.address && <span> Our address: <strong>{site.address}</strong>.</span>}
                {site.business_hours && <span> Collection hours: <strong>{site.business_hours}</strong>.</span>}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">c) Truck / Bulk Delivery</h3>
              <p className="mt-1 text-sm">
                For heavy, oversized, or bulk chemical/timber orders, we arrange truck delivery. A member of our team will
                contact you before dispatch to confirm the delivery date, time window, and any site access requirements.
                Delivery fees for truck orders are quoted individually.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">3. Delivery Timelines</h2>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Option</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Area</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Estimated Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="px-4 py-3">Standard Delivery</td>
                  <td className="px-4 py-3">Nairobi &amp; environs</td>
                  <td className="px-4 py-3 font-medium">2–5 business days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Standard Delivery</td>
                  <td className="px-4 py-3">Other Kenyan counties</td>
                  <td className="px-4 py-3 font-medium">5–10 business days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Self Pickup</td>
                  <td className="px-4 py-3">Our warehouse</td>
                  <td className="px-4 py-3 font-medium">Same day (after confirmation)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Bulk / Truck</td>
                  <td className="px-4 py-3">As agreed</td>
                  <td className="px-4 py-3 font-medium">Scheduled with customer</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">* Timelines are estimates and begin after payment is confirmed. They may be affected by public holidays and force majeure events.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">4. Delivery Costs</h2>
          <p>
            Delivery fees are calculated at checkout based on your location and order size. For bulk or truck deliveries, fees
            are communicated separately as part of the quote process.
          </p>
          <p className="mt-3">
            Self pickup carries no delivery charge.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">5. Order Tracking</h2>
          <p>
            Once your order is dispatched, you will receive a confirmation by email and/or SMS with tracking information where
            available. You can also view your order status in your{' '}
            <Link href="/order-history" className="text-[#ec5b13] underline">Order History</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">6. Damaged or Lost Parcels</h2>
          <p>
            If your order arrives damaged or does not arrive within the estimated window, please contact us within <strong>48 hours</strong> of
            the expected delivery date. We will investigate and, where appropriate, re-dispatch or refund your order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">7. Contact</h2>
          <div className="mt-3 bg-gray-50 rounded-xl p-5 text-sm space-y-1 flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#ec5b13] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>For shipping enquiries, contact us at:</p>
              <p>Email: <a href={`mailto:${email}`} className="text-[#ec5b13] underline">{email}</a></p>
              {site.contact_phone && <p>Phone: {site.contact_phone}</p>}
            </div>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/returns-policy" className="hover:text-[#003366] transition-colors">Returns &amp; Refunds</Link>
        <Link href="/faq" className="hover:text-[#003366] transition-colors">FAQ</Link>
        <Link href="/terms" className="hover:text-[#003366] transition-colors">Terms &amp; Conditions</Link>
      </div>
    </div>
  )
}
