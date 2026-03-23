import { Metadata } from 'next'
import { getUser, getUserProfile } from '@/lib/auth'
import { getPublicSiteSettings } from '@/lib/settings'
import { QuoteForm } from './quote-form'

const SITE_URL = 'https://bewama.com'

export const metadata: Metadata = {
  title: 'Request a Quote | Bewama Industrial',
  description: 'Request a custom quote for bulk chemical, timber, or industrial material orders. Our team responds within 24 hours.',
  alternates: { canonical: `${SITE_URL}/request-quote` },
  openGraph: {
    title: 'Request a Quote | Bewama Industrial',
    description: 'Request a custom quote for bulk chemical or timber orders. We respond within 24 hours.',
    type: 'website',
    url: `${SITE_URL}/request-quote`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request a Quote | Bewama Industrial',
    description: 'Request a custom quote for bulk chemical or timber orders. We respond within 24 hours.',
  },
}

export default async function RequestQuotePage({
  searchParams,
}: {
  searchParams: { product?: string }
}) {
  const product = searchParams.product ?? ''

  const [user, profile, site] = await Promise.all([
    getUser().catch(() => null),
    getUserProfile().catch(() => null),
    getPublicSiteSettings(),
  ])

  const prefill = profile
    ? {
        fullName: (profile as Record<string, unknown>).full_name as string ?? '',
        email:    user?.email ?? '',
        phone:    (profile as Record<string, unknown>).phone as string ?? '',
        company:  (profile as Record<string, unknown>).company as string ?? '',
      }
    : null

  const contact = {
    phone:   site.contact_phone,
    email:   site.contact_email,
    address: site.address,
  }

  return (
    <QuoteForm
      product={product}
      prefill={prefill}
      contact={contact}
      isLoggedIn={!!user}
      userName={(profile as Record<string, unknown> | null)?.full_name as string ?? null}
    />
  )
}
