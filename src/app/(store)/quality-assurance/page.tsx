import { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/settings'
import Link from 'next/link'
import { ShieldCheck, FlaskConical, Truck, FileText, Award } from 'lucide-react'

const SITE_URL = 'https://bewama.com'

export const metadata: Metadata = {
  title: 'Quality Assurance | Bewama Industrial',
  description: 'How Bewama Investments ensures product quality through supplier verification, inspection, and safe handling of industrial materials.',
  alternates: { canonical: `${SITE_URL}/quality-assurance` },
  openGraph: {
    title: 'Quality Assurance | Bewama Industrial',
    description: 'How Bewama Investments ensures product quality, supplier verification, and safe handling.',
    type: 'website',
    url: `${SITE_URL}/quality-assurance`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quality Assurance | Bewama Industrial',
    description: 'How Bewama Investments ensures product quality, supplier verification, and safe handling.',
  },
}

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Supplier Verification',
    desc: 'Every supplier undergoes a due-diligence review before onboarding. We verify business registration, production licences, and compliance with Kenyan and international trade standards.',
  },
  {
    icon: FlaskConical,
    title: 'Product Inspection',
    desc: 'Products are inspected upon receipt at our warehouse. Chemical batches are cross-checked against Certificates of Analysis (COA). Timber and construction materials are graded for structural integrity.',
  },
  {
    icon: FileText,
    title: 'Documentation',
    desc: 'We maintain Safety Data Sheets (SDS/MSDS), Certificates of Origin, and COAs for all chemical products. Documents are available to customers on request.',
  },
  {
    icon: Truck,
    title: 'Safe Handling & Storage',
    desc: 'Hazardous materials are stored and handled in compliance with the Kenya Chemical Regulations. Staff handling dangerous goods hold relevant safety training certificates.',
  },
  {
    icon: Award,
    title: 'Customer Feedback Loop',
    desc: 'We take quality complaints seriously. Any reported defect triggers a supplier investigation and corrective action. Repeat non-conformance leads to supplier removal.',
  },
]

export default async function QualityAssurancePage() {
  const site = await getPublicSiteSettings()
  const email = site.contact_email || 'info@bewama.com'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-2">Company</p>
        <h1 className="text-4xl font-extrabold text-[#061f3f]">Quality Assurance</h1>
        <p className="text-gray-500 mt-3 text-lg leading-relaxed">
          At Bewama Investments, quality is not an afterthought. Every product we supply is backed by
          verified sourcing, documented compliance, and rigorous handling standards.
        </p>
      </div>

      {/* Pillars */}
      <div className="space-y-6 mb-14">
        {pillars.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="flex gap-5 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
            <div className="w-11 h-11 bg-[#061f3f] rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#ff5f14]">0{i + 1}</span>
                <h3 className="font-bold text-[#061f3f]">{title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">Our Product Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {[
              { name: 'Industrial Chemicals', detail: 'Solvents, acids, bases, industrial cleaning agents, and specialty chemicals sourced from certified manufacturers.' },
              { name: 'Timber & Wood Products', detail: 'Structural timber, plywood, hardwood, and engineered wood graded to Kenyan Bureau of Standards (KEBS) specifications.' },
              { name: 'Construction Materials', detail: 'Supporting materials for industrial and commercial construction with documented load-bearing and safety ratings.' },
              { name: 'Specialty Compounds', detail: 'Custom or specialty compounds supplied with full batch documentation, COAs, and handling guidelines.' },
            ].map(({ name, detail }) => (
              <div key={name} className="p-4 border border-gray-100 rounded-xl">
                <p className="font-semibold text-sm text-[#061f3f] mb-1">{name}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">Regulatory Compliance</h2>
          <p>
            Bewama Investments operates in compliance with relevant Kenyan legislation governing the import, storage, and
            distribution of chemical and industrial products, including:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-sm">
            <li>The Kenya Chemical Regulations under the Pest Control Products Act</li>
            <li>KEBS standards for timber and construction materials</li>
            <li>NEMA environmental guidelines for chemical handling and waste disposal</li>
            <li>Kenya Revenue Authority import documentation requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">Requesting Product Documentation</h2>
          <p>
            Customers requiring Safety Data Sheets (SDS), Certificates of Analysis, Certificates of Origin, or
            product specification sheets may request these at the time of quoting or after purchase. Contact us at{' '}
            <a href={`mailto:${email}`} className="text-[#ff5f14] underline">{email}</a> with your order or quote reference.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#061f3f] mb-3">Reporting a Quality Issue</h2>
          <p>
            If a product you received does not meet the agreed specification or is defective, please contact us within
            <strong> 48 hours of delivery</strong>. Include your order number, photos of the product and packaging, and a
            description of the issue. We will investigate and, where confirmed, arrange a suitable replacement, Bewama Store
            Credit, or any other remedy required by Kenyan law under our{' '}
            <Link href="/returns-policy" className="text-[#ff5f14] underline">Returns &amp; Store Credit Policy</Link>.
          </p>
        </section>

      </div>

      {/* CTA */}
      <div className="mt-12 p-7 bg-[#061f3f] text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-lg">Need product documentation?</p>
          <p className="text-gray-300 text-sm mt-1">Request SDS, COA, or spec sheets for any product.</p>
        </div>
        <Link
          href="/request-quote"
          className="shrink-0 bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Contact Us
        </Link>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/shipping-policy" className="hover:text-[#061f3f] transition-colors">Shipping Policy</Link>
        <Link href="/returns-policy" className="hover:text-[#061f3f] transition-colors">Returns &amp; Store Credit</Link>
        <Link href="/faq" className="hover:text-[#061f3f] transition-colors">FAQ</Link>
      </div>
    </div>
  )
}
