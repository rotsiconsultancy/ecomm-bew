import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, FileText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Quote Submitted | Bewama',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ id?: string }>
}

export default async function QuoteSubmittedPage({ searchParams }: Props) {
  const { id } = await searchParams
  const shortRef = id ? id.slice(0, 8).toUpperCase() : 'N/A'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="bg-green-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-[#061f3f] tracking-tight">Quote Request Received!</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Thank you for choosing Bewama. Our team is reviewing your requirements and will get back to you within 24 hours.
        </p>
      </div>

      <div className="mt-12 bg-white p-8 rounded-2xl border-2 border-[#061f3f] shadow-xl max-w-lg mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FileText className="h-24 w-24 text-[#061f3f]" />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Reference Number</p>
          <span className="block text-3xl font-extrabold text-[#061f3f] font-mono">{shortRef}</span>
          <p className="text-xs text-gray-400">Please quote this reference for any future inquiries.</p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          { n: '1', title: 'Reviewing Request', desc: 'Our team evaluates product availability and wholesale pricing based on your volume.' },
          { n: '2', title: 'Finalizing Quote', desc: 'We calculate the most efficient logistics and shipping options for your location.' },
          { n: '3', title: 'Direct Contact', desc: 'An account manager will email you the finalized proposal within 24 hours.' },
        ].map(({ n, title, desc }) => (
          <div key={n} className="space-y-3">
            <div className="h-10 w-10 bg-[#061f3f] rounded-full flex items-center justify-center text-white font-bold">{n}</div>
            <h4 className="font-bold text-[#061f3f]">{title}</h4>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
        <Button asChild className="px-10 h-14 bg-[#061f3f] hover:bg-[#03152d] text-white font-extrabold text-lg shadow-lg">
          <Link href="/products">Browse Products</Link>
        </Button>
        <Button variant="outline" asChild className="px-10 h-14 border-2 border-[#061f3f] text-[#061f3f] hover:bg-[#061f3f] hover:text-white font-extrabold text-lg transition-all">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <div className="mt-12 text-gray-400 text-sm flex items-center justify-center gap-2">
        <Send className="h-4 w-4" />
        <span>We&apos;ll contact you within 24 hours with a personalised quote.</span>
      </div>
    </div>
  )
}
