import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { SupplierAuthModal } from '@/app/(store)/become-supplier/supplier-auth-modal'
import { AcceptInviteButton } from './accept-invite-button'

type Props = { params: Promise<{ token: string }> }

export default async function SupplierInvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <SupplierAuthModal next={`/supplier-portal/invite/${token}`} />

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-16">
      <Card className="mx-auto max-w-md p-7">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Supplier invite</p>
        <h1 className="mt-2 text-2xl font-black text-[#061f3f]">Join supplier portal</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-gray-500">
          Accept this 7-day invite to access the supplier company workspace attached to your email.
        </p>
        <div className="mt-6">
          <AcceptInviteButton token={token} />
        </div>
      </Card>
    </main>
  )
}
