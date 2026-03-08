import { Metadata } from 'next'
import { getPublicSiteSettings } from '@/lib/settings'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Bewama',
  description: 'How Bewama Investments collects, uses, and protects your personal data.',
}

export default async function PrivacyPolicyPage() {
  const site = await getPublicSiteSettings()
  const email = site.contact_email || 'info@bewama.com'
  const year = new Date().getFullYear()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-2">Legal</p>
        <h1 className="text-4xl font-extrabold text-[#003366]">Privacy Policy</h1>
        <p className="text-gray-500 mt-3">Effective date: 1 January {year} &nbsp;·&nbsp; Bewama Investments</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">1. Introduction</h2>
          <p>
            Bewama Investments (<strong>"Bewama"</strong>, <strong>"we"</strong>, <strong>"us"</strong>) is committed to protecting
            your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights under the
            <strong> Kenya Data Protection Act, 2019 (DPA 2019)</strong>.
          </p>
          <p className="mt-3">
            By using our website (<strong>bewama.com</strong>) or placing an order, you agree to this Policy. If you do not agree,
            please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">2. Data We Collect</h2>
          <p>We collect personal data that you provide to us directly and data generated through your use of the platform:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Account information:</strong> full name, email address, phone number, company name, and role.</li>
            <li><strong>Order &amp; quote data:</strong> products requested, quantities, delivery addresses, and special instructions.</li>
            <li><strong>Payment data:</strong> payment method and transaction references. We do not store full card numbers or mobile money PINs.</li>
            <li><strong>Usage data:</strong> pages visited, search queries, cart contents, browser type, IP address, and device identifiers.</li>
            <li><strong>Communications:</strong> messages or enquiries you send us via quote forms or email.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">3. How We Use Your Data</h2>
          <p>We process your personal data for the following purposes:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>To create and manage your account.</li>
            <li>To process and fulfil orders and quote requests.</li>
            <li>To send order confirmations, shipping updates, and customer support communications.</li>
            <li>To send marketing communications where you have given consent (you may opt out at any time).</li>
            <li>To improve our platform, detect fraud, and ensure security.</li>
            <li>To comply with our legal and regulatory obligations in Kenya.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">4. How We Share Your Data</h2>
          <p>We do not sell your personal data. We share it only with:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Supabase Inc.:</strong> our database and authentication infrastructure provider. Data is stored on secure servers.</li>
            <li><strong>Payment processors</strong> (e.g. Rotsi / M-Pesa, PayPal): solely to process your transactions.</li>
            <li><strong>Logistics partners</strong> (e.g. Pickup Mtaani): only the name, phone, and delivery address needed to complete your order.</li>
            <li><strong>Email / SMS providers</strong> (Resend, Africa's Talking): to deliver transactional notifications.</li>
            <li><strong>Law enforcement or regulators</strong> when required by law or court order.</li>
          </ul>
          <p className="mt-3">All third-party processors are contractually bound to process your data only on our instructions and in compliance with applicable law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">5. Data Security</h2>
          <p>
            We implement industry-standard security measures including encrypted connections (HTTPS/TLS), hashed passwords,
            row-level security on our database, and access controls. Despite these measures, no system is completely secure.
            Please notify us immediately at <a href={`mailto:${email}`} className="text-[#ec5b13] underline">{email}</a> if you
            suspect unauthorised access to your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">6. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide services. Specifically:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Account data:</strong> retained until you request deletion, plus a 30-day grace period.</li>
            <li><strong>Order &amp; financial records:</strong> retained for <strong>7 years</strong> to comply with Kenyan tax law (Income Tax Act, Cap. 470).</li>
            <li><strong>Marketing consent records:</strong> retained for 3 years after the last interaction.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">7. Cookies</h2>
          <p>
            We use essential cookies to keep you signed in and remember your cart. We do not use third-party advertising cookies.
            You can disable cookies in your browser settings, but some features may not work correctly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">8. Your Rights under the Kenya DPA 2019</h2>
          <p>As a data subject, you have the right to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Access</strong> the personal data we hold about you.</li>
            <li><strong>Rectification</strong> of inaccurate or incomplete data.</li>
            <li><strong>Erasure</strong> ("right to be forgotten") of your data, subject to legal retention obligations.</li>
            <li><strong>Object</strong> to processing for direct marketing purposes at any time.</li>
            <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
            <li><strong>Lodge a complaint</strong> with the <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-[#ec5b13] underline">Office of the Data Protection Commissioner (ODPC)</a>.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at <a href={`mailto:${email}`} className="text-[#ec5b13] underline">{email}</a>.
            We will respond within <strong>21 days</strong> as required by the DPA 2019.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">9. Children's Privacy</h2>
          <p>
            Our platform is not intended for individuals under 18. We do not knowingly collect data from minors. If you believe
            a minor has submitted data to us, please contact us and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Policy from time to time. We will notify registered users by email of material changes.
            The "Effective date" at the top of this page indicates when the Policy was last revised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#003366] mb-3">11. Contact Us</h2>
          <p>For any privacy-related questions or requests:</p>
          <div className="mt-3 bg-gray-50 rounded-xl p-5 text-sm space-y-1">
            <p><strong>Bewama Investments</strong></p>
            {site.address && <p>{site.address}</p>}
            <p>Email: <a href={`mailto:${email}`} className="text-[#ec5b13] underline">{email}</a></p>
            {site.contact_phone && <p>Phone: {site.contact_phone}</p>}
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/terms" className="hover:text-[#003366] transition-colors">Terms &amp; Conditions</Link>
        <Link href="/shipping-policy" className="hover:text-[#003366] transition-colors">Shipping Policy</Link>
        <Link href="/returns-policy" className="hover:text-[#003366] transition-colors">Returns &amp; Refunds</Link>
      </div>
    </div>
  )
}
