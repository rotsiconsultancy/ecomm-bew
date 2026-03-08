import Link from 'next/link'
import { getPublicSiteSettings } from '@/lib/settings'

export async function Footer() {
  const site = await getPublicSiteSettings()

  const socials = [
    { label: 'Facebook',  href: site.social_links.facebook },
    { label: 'Instagram', href: site.social_links.instagram },
    { label: 'LinkedIn',  href: site.social_links.linkedin },
    { label: 'Twitter',   href: site.social_links.twitter },
    { label: 'WhatsApp',  href: site.social_links.whatsapp },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href))

  return (
    <footer className="bg-[#003366] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand — spans 2 cols on lg */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-2xl font-extrabold tracking-tight">{site.name.toUpperCase()}</span>
            {site.tagline && (
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">{site.tagline}</p>
            )}
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {socials.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-gray-400 hover:text-[#ec5b13] transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Catalog</h5>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/products">Product Catalog</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/categories">Categories</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/request-quote">Request a Quote</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/blog">Blog</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/resources">Resources</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h5 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Support</h5>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/shipping-policy">Shipping Policy</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/returns-policy">Returns &amp; Refunds</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/quality-assurance">Quality Assurance</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Contact</h5>
            <div className="space-y-2.5 text-gray-400 text-sm">
              {site.contact_email && (
                <p>
                  <a href={`mailto:${site.contact_email}`} className="hover:text-[#ec5b13] transition-colors">
                    {site.contact_email}
                  </a>
                </p>
              )}
              {site.contact_phone && (
                <p>
                  <a href={`tel:${site.contact_phone.replace(/\s/g, '')}`} className="hover:text-[#ec5b13] transition-colors">
                    {site.contact_phone}
                  </a>
                </p>
              )}
              {site.address && <p className="leading-relaxed">{site.address}</p>}
              {site.business_hours && <p className="text-xs text-gray-500 mt-1">{site.business_hours}</p>}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-[#ec5b13] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#ec5b13] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/shipping-policy" className="hover:text-[#ec5b13] transition-colors">Shipping</Link>
            <Link href="/returns-policy" className="hover:text-[#ec5b13] transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
