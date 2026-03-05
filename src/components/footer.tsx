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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <span className="text-2xl font-extrabold tracking-tight">{site.name.toUpperCase()}</span>
            {site.tagline && (
              <p className="text-gray-400 text-sm">{site.tagline}</p>
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

          {/* Quick links */}
          <div>
            <h5 className="font-bold text-lg mb-4">Quick Links</h5>
            <ul className="space-y-2 text-gray-400">
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/products">Product Catalog</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/request-quote">Request a Quote</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/blog">Blog</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/resources">Resources</Link></li>
            </ul>
          </div>

          {/* Customer support */}
          <div>
            <h5 className="font-bold text-lg mb-4">Customer Support</h5>
            <ul className="space-y-2 text-gray-400">
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/products">Shipping Policy</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/products">Returns &amp; Refunds</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/products">Quality Assurance</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/products">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold text-lg mb-4">Contact</h5>
            <div className="space-y-2 text-gray-400 text-sm">
              {site.contact_email && <p>Email: {site.contact_email}</p>}
              {site.contact_phone && <p>Phone: {site.contact_phone}</p>}
              {site.address && <p>{site.address}</p>}
              {site.business_hours && <p className="text-xs text-gray-500 mt-1">{site.business_hours}</p>}
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
