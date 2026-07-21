import { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/settings'
import Link from 'next/link'

const SITE_URL = 'https://bewama.com'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Bewama',
  description: 'The terms and conditions governing your use of the Bewama platform and purchases made through bewama.com.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: 'Terms & Conditions | Bewama',
    description: 'The terms and conditions governing your use of the Bewama platform and purchases.',
    type: 'website',
    url: `${SITE_URL}/terms`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions | Bewama',
    description: 'The terms and conditions governing your use of the Bewama platform and purchases.',
  },
}

export default async function TermsPage() {
  const site = await getPublicSiteSettings()
  const email = site.contact_email || 'info@bewama.com'
  const year = new Date().getFullYear()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-2">Legal</p>
        <h1 className="text-4xl font-extrabold text-[#061f3f]">Terms &amp; Conditions</h1>
        <p className="text-gray-500 mt-3">Effective date: 1 January {year} &nbsp;·&nbsp; Bewama Investments</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Bewama website (<strong>bewama.com</strong>), placing an order, or submitting a quote
            request, you agree to be bound by these Terms &amp; Conditions. If you do not agree, you must not use the platform.
          </p>
          <p className="mt-3">
            These Terms apply to all visitors, customers, and registered users. For business customers placing orders on behalf
            of a company, you warrant that you have authority to bind that company.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">2. About Us</h2>
          <p>
            <strong>Bewama Investments</strong> is a business registered in Kenya, operating as an industrial materials supplier
            and trading platform for chemicals, timber, and related industrial products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">3. Account Registration</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 18 years old to create an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must notify us immediately of any unauthorised access to your account.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            <li>You agree to provide accurate and current information at the time of registration and to keep it updated.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">4. Products, Pricing &amp; Availability</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All prices are displayed in Kenyan Shillings (KES) unless otherwise stated, and are inclusive of applicable taxes.</li>
            <li>Prices are subject to change without notice. The price applicable to your order is the price at the time you confirm checkout.</li>
            <li>Product availability is not guaranteed. If a product becomes unavailable after your order, we will notify you and provide a full refund.</li>
            <li>Product images are for illustrative purposes only. Actual products may vary in appearance.</li>
            <li>Certain products are available on a quote-only basis for bulk orders. Finalised prices are confirmed in the written quote we issue.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">5. Orders &amp; Payment</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order.</li>
            <li>An order is confirmed only upon receipt of payment and our written confirmation.</li>
            <li>We accept payment via M-Pesa (Rotsi), PayPal, debit/credit card, and Cash on Delivery (COD) where available.</li>
            <li>For COD orders, full payment is required upon delivery to the verified delivery address.</li>
            <li>We are not liable for payment delays or failures caused by your bank or payment provider.</li>
            <li>All transactions are processed securely. We do not store full card or mobile money credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">6. Quotes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>A submitted quote request is not a binding order — it is a request for a price offer.</li>
            <li>Quotes issued by Bewama are valid for <strong>14 calendar days</strong> from the date of issue unless stated otherwise.</li>
            <li>Accepting a quote and making payment constitutes a binding purchase agreement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">7. Delivery</h2>
          <p>
            Delivery terms are set out in our <Link href="/shipping-policy" className="text-[#ff5f14] underline">Shipping Policy</Link>.
            Delivery timelines are estimates only and are not guaranteed. We are not liable for delays caused by circumstances beyond our control
            (force majeure), including but not limited to traffic, weather, strikes, or supplier delays.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">8. Returns &amp; Cancellations</h2>
          <p>
            Our <Link href="/returns-policy" className="text-[#ff5f14] underline">Returns &amp; Store Credit Policy</Link> forms part of
            these Terms. Please review it before placing an order. Certain product categories (custom orders, opened bulk chemicals)
            are non-returnable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">9. Intellectual Property</h2>
          <p>
            All content on this platform — including text, images, logos, product descriptions, and code — is the property of
            Bewama Investments or its licensors and is protected by Kenyan and international intellectual property law. You may
            not reproduce, copy, or distribute any content without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">10. Disclaimer of Warranties</h2>
          <p>
            The platform is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we make no
            warranties — express or implied — regarding the availability, accuracy, or fitness for purpose of the platform or
            any products listed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">11. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by Kenyan law, Bewama Investments shall not be liable for any indirect, incidental,
            special, or consequential loss arising from your use of the platform. Our total liability to you for any claim shall
            not exceed the amount you paid for the relevant order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">12. Governing Law &amp; Dispute Resolution</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the <strong>Republic of Kenya</strong>.
            Any disputes shall first be attempted to be resolved amicably. If unresolved within 30 days, disputes shall be
            referred to the courts of competent jurisdiction in Nairobi, Kenya.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">13. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. We will notify registered users of material changes by email. Continued use
            of the platform after changes are published constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">14. Contact Us</h2>
          <div className="mt-3 bg-gray-50 rounded-xl p-5 text-sm space-y-1">
            <p><strong>Bewama Investments</strong></p>
            {site.address && <p>{site.address}</p>}
            <p>Email: <a href={`mailto:${email}`} className="text-[#ff5f14] underline">{email}</a></p>
            {site.contact_phone && <p>Phone: {site.contact_phone}</p>}
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/privacy-policy" className="hover:text-[#061f3f] transition-colors">Privacy Policy</Link>
        <Link href="/shipping-policy" className="hover:text-[#061f3f] transition-colors">Shipping Policy</Link>
        <Link href="/returns-policy" className="hover:text-[#061f3f] transition-colors">Returns &amp; Store Credit</Link>
      </div>
    </div>
  )
}
