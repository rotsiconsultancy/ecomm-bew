import { Metadata } from 'next'
import { getUser, getUserProfile } from '@/lib/auth'
import { getPublicSiteSettings } from '@/lib/settings'
import { QuoteForm } from './quote-form'

export const metadata: Metadata = {
  title: 'Request a Quote | Bewama',
  description: 'Request a custom quote for bulk chemical or timber orders. We respond within 24 hours.',
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
