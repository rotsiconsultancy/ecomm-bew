import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from './checkout-form'

export default async function CheckoutPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirectTo=/checkout')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-[#003366] mb-8">Checkout</h1>
      <CheckoutForm
        userId={user.id}
        defaultEmail={user.email ?? ''}
        defaultName={profile?.full_name ?? ''}
        defaultPhone={profile?.phone ?? ''}
      />
    </div>
  )
}
