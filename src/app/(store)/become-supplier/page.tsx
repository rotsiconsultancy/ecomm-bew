import Link from 'next/link'
import { CheckCircle2, ClipboardList, PackagePlus, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SupplierAuthModal } from './supplier-auth-modal'
import { SupplierApplicationForm } from './supplier-application-form'

export const metadata = {
  title: 'Become a Supplier | Bewama',
  description: 'Apply to supply products through Bewama.',
}

export default async function BecomeSupplierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <SupplierAuthModal />

  const [{ data: profile }, { data: application }, { data: member }] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle(),
    supabase
      .from('supplier_applications')
      .select('id, status, company_name, admin_notes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('supplier_members')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
  ])

  return (
    <main className="bg-[#f6f8fb] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Supplier marketplace</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#061f3f] sm:text-5xl">
            Partner with Bewama.
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-[#4b5a6a]">
            Apply once, get reviewed by Bewama, then manage products, delivery regions, staff, and fulfilments from your supplier portal.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              ['Apply while logged in', ClipboardList],
              ['Admin approval protects buyer trust', ShieldCheck],
              ['Approved suppliers publish products directly', PackagePlus],
              ['Fulfilment stays organized by supplier', CheckCircle2],
            ].map(([label, Icon]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-lg border border-[#d8e0ea] bg-white px-4 py-3">
                <Icon className="h-5 w-5 text-[#ff5f14]" />
                <span className="text-sm font-black text-[#061f3f]">{label as string}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          {member ? (
            <div className="rounded-xl border border-green-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black text-[#061f3f]">You are already a supplier</h2>
              <p className="mt-2 text-sm font-semibold text-[#4b5a6a]">Continue setup and manage your supplier account from the portal.</p>
              <Link href="/supplier-portal" className="mt-5 inline-flex h-11 items-center rounded-lg bg-[#ff5f14] px-5 text-sm font-black text-white">
                Open supplier portal
              </Link>
            </div>
          ) : application?.status === 'pending' ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-7 shadow-sm">
              <h2 className="text-2xl font-black text-yellow-900">Application pending</h2>
              <p className="mt-2 text-sm font-semibold text-yellow-800">
                Your application for {application.company_name} is waiting for Bewama review.
              </p>
            </div>
          ) : application?.status === 'approved' ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-7 shadow-sm">
              <h2 className="text-2xl font-black text-green-900">Application approved</h2>
              <p className="mt-2 text-sm font-semibold text-green-800">Your supplier account is ready.</p>
              <Link href="/supplier-portal" className="mt-5 inline-flex h-11 items-center rounded-lg bg-[#ff5f14] px-5 text-sm font-black text-white">
                Open supplier portal
              </Link>
            </div>
          ) : (
            <SupplierApplicationForm
              defaultName={profile?.full_name ?? ''}
              defaultEmail={user.email ?? ''}
            />
          )}
        </section>
      </div>
    </main>
  )
}
