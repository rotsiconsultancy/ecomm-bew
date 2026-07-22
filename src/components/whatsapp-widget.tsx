import { FaWhatsapp } from 'react-icons/fa'
import { getPublicSiteSettings } from '@/lib/settings'

function toWhatsAppNumber(phone: string): string {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')

  if (trimmed.startsWith('+')) return digits
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('0')) return `254${digits.slice(1)}`
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) return `254${digits}`

  return digits
}

export async function WhatsAppWidget() {
  const site = await getPublicSiteSettings()
  const phone = toWhatsAppNumber(site.contact_phone)

  if (!phone) return null

  const message = `Hello ${site.name || 'Bewama'}, I would like some help with a product.`
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${site.name || 'Bewama'} on WhatsApp`}
      title="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-[#25D366] text-white shadow-[0_10px_30px_rgba(6,31,63,0.28)] transition duration-200 hover:-translate-y-1 hover:bg-[#20bd5a] hover:shadow-[0_14px_36px_rgba(6,31,63,0.34)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/35 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-[#061f3f] px-3 py-2 text-xs font-extrabold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
        Chat with us
      </span>
      <FaWhatsapp aria-hidden="true" className="h-7 w-7 sm:h-8 sm:w-8" />
    </a>
  )
}
