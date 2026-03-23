import Link from 'next/link'
import Image from 'next/image'
import { getPublicSiteSettings } from '@/lib/settings'
import { FaWhatsapp, FaInstagram, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

export async function Footer() {
  const site = await getPublicSiteSettings()

  // Mapping labels to their respective icons
  const iconMap: Record<string, any> = {
    Facebook: <FaFacebook />,
    Instagram: <FaInstagram />,
    LinkedIn: <FaLinkedin />,
    Twitter: <FaTwitter />,
    WhatsApp: <FaWhatsapp />,
  };

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
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
               <span className="text-2xl font-extrabold tracking-tight block">{site.name.toUpperCase()}</span>
               {site.tagline && (
                 <p className="text-gray-400 text-sm max-w-xs leading-relaxed italic">{site.tagline}</p>
               )}
            </div>
            
            {site.logo_url && (
              <Image src={site.logo_url} alt={`${site.name} logo`} width={180} height={100} className="object-contain" />
            )}

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {socials.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#ec5b13] transition-all group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {iconMap[label]}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300 border-b border-white/10 pb-2">Catalog</h5>
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
            <h5 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300 border-b border-white/10 pb-2">Support</h5>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/shipping-policy">Shipping Policy</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/returns-policy">Returns &amp; Refunds</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/quality-assurance">Quality Assurance</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/faq">FAQ</Link></li>
              <li><Link className="hover:text-[#ec5b13] transition-colors" href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300 border-b border-white/10 pb-2">Contact</h5>
            <div className="space-y-3 text-gray-400 text-sm">
              {site.contact_email && (
                <p>
                  <a href={`mailto:${site.contact_email}`} className="hover:text-[#ec5b13] transition-colors flex items-center gap-2">
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
              {site.address && <p className="leading-relaxed text-xs">{site.address}</p>}
              {site.business_hours && (
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-white/40">Business Hours</span>
                  <p className="text-xs text-gray-500">{site.business_hours}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-widest text-gray-500">
          <p>© {new Date().getFullYear()} {site.name}.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping</Link>
            <Link href="/returns-policy" className="hover:text-white transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}