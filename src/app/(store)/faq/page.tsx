import { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/settings'
import Link from 'next/link'

const SITE_URL = 'https://bewama.com'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Bewama',
  description: 'Frequently asked questions about ordering, delivery, payments, returns, and more at Bewama Industrial.',
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: 'Frequently Asked Questions | Bewama',
    description: 'Frequently asked questions about ordering, delivery, payments, returns, and more at Bewama Industrial.',
    type: 'website',
    url: `${SITE_URL}/faq`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | Bewama',
    description: 'Frequently asked questions about ordering, delivery, payments, returns, and more at Bewama Industrial.',
  },
}

const faqs = [
  {
    category: 'Orders & Quoting',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse our product catalog, add items to your cart, then proceed to checkout. For bulk or custom orders, use the Request a Quote form and our team will respond within 24 hours.',
      },
      {
        q: 'What is the minimum order quantity?',
        a: 'There is no minimum for standard products sold by unit. For bulk chemicals, timber, and other industrial materials, minimum quantities vary by product and are shown on the product page or confirmed in your quote.',
      },
      {
        q: 'How long is a quote valid?',
        a: 'Quotes issued by Bewama are valid for 14 calendar days from the date of issue, unless stated otherwise in the quote document.',
      },
      {
        q: 'Can I order as a guest without registering?',
        a: 'You can submit a quote request without an account. However, to place a checkout order and track your order history, you will need to create a free account.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'You can cancel or modify an order before it is dispatched. Contact us immediately after placing your order. Once dispatched, standard returns apply.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept M-Pesa (via Rotsi), PayPal, debit/credit card, and Cash on Delivery (COD) for eligible orders within Nairobi.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. All transactions are processed over encrypted HTTPS connections. We do not store your card number or M-Pesa PIN — payments are handled by our certified payment processors.',
      },
      {
        q: 'Do you offer credit or payment terms for business customers?',
        a: 'Net-30 and Net-60 payment terms may be available for verified wholesale customers. Contact us to discuss your requirements.',
      },
      {
        q: 'Will I receive a receipt or invoice?',
        a: 'Yes — a VAT receipt and order confirmation are emailed to you automatically after every successful payment.',
      },
    ],
  },
  {
    category: 'Delivery & Shipping',
    items: [
      {
        q: 'Where do you deliver?',
        a: 'We deliver within Nairobi as standard. Deliveries to other Kenyan counties are available by arrangement. For international (export) orders, please submit a quote request.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery within Nairobi takes 2–5 business days. Other counties take 5–10 business days. Bulk truck deliveries are scheduled directly with you before dispatch.',
      },
      {
        q: 'Can I collect my order from your warehouse?',
        a: 'Yes — self pickup is available from our Nairobi warehouse at no delivery charge. We will notify you when your order is ready for collection.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once dispatched, you will receive an email/SMS with tracking information. You can also view your order status in your account under Order History.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'Most unused items in original packaging can be returned within 14 days of delivery. See our Returns & Refunds page for full details, including non-returnable items.',
      },
      {
        q: 'My order arrived damaged — what do I do?',
        a: 'Contact us within 48 hours of delivery with photos of the damage. We will arrange a replacement or full refund, and cover any return shipping costs.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Approved refunds are processed within 7–14 business days and returned via your original payment method.',
      },
    ],
  },
  {
    category: 'Products & Quality',
    items: [
      {
        q: 'Where do your products come from?',
        a: 'We source directly from verified manufacturers and approved distributors. All products undergo quality checks before dispatch.',
      },
      {
        q: 'Do you provide Safety Data Sheets (SDS) for chemicals?',
        a: 'Yes — Safety Data Sheets are available for all chemical products. Contact us or request them alongside your quote.',
      },
      {
        q: 'Can I request a sample before a bulk order?',
        a: 'Sample requests are considered on a case-by-case basis. Include your request in the quote form and our team will advise.',
      },
    ],
  },
]

export default async function FAQPage() {
  const site = await getPublicSiteSettings()
  const email = site.contact_email || 'info@bewama.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap(category => category.items).map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-2">Support</p>
        <h1 className="text-4xl font-extrabold text-[#003366]">Frequently Asked Questions</h1>
        <p className="text-gray-500 mt-3">
          Can&apos;t find an answer?{' '}
          <a href={`mailto:${email}`} className="text-[#ec5b13] underline font-medium">Email us</a>
          {site.contact_phone && <> or call <a href={`tel:${site.contact_phone.replace(/\s/g, '')}`} className="text-[#ec5b13] underline font-medium">{site.contact_phone}</a></>} — we respond within 24 hours.
        </p>
      </div>

      <div className="space-y-10">
        {faqs.map(({ category, items }) => (
          <section key={category}>
            <h2 className="text-lg font-bold text-[#003366] mb-4 pb-2 border-b border-gray-100">
              {category}
            </h2>
            <div className="space-y-0 divide-y divide-gray-50">
              {items.map(({ q, a }) => (
                <details key={q} className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                    <span className="font-semibold text-gray-800 text-sm group-open:text-[#003366] transition-colors">{q}</span>
                    <span className="text-gray-400 group-open:rotate-45 transition-transform shrink-0 text-xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-14 bg-[#003366] text-white rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
        <p className="text-gray-300 text-sm mb-6">Our team is available during business hours to help with any enquiry.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Email Us
          </a>
          <Link
            href="/request-quote"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Request a Quote
          </Link>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/shipping-policy" className="hover:text-[#003366] transition-colors">Shipping Policy</Link>
        <Link href="/returns-policy" className="hover:text-[#003366] transition-colors">Returns &amp; Refunds</Link>
        <Link href="/quality-assurance" className="hover:text-[#003366] transition-colors">Quality Assurance</Link>
      </div>
    </div>
  )
}
