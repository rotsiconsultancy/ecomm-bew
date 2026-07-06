import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getCheckoutConfig } from '@/lib/checkout'
import { SettingsView } from './settings-view'

export const metadata: Metadata = {
  title: 'Account Settings | Bewama',
  robots: { index: false, follow: false },
}

export default async function AccountSettingsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('influence_mode_enabled')
    .eq('id', user.id)
    .maybeSingle()

  const config = await getCheckoutConfig()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-[#061f3f] mb-8">Account Settings</h1>
      <SettingsView
        influenceEnabled={profile?.influence_mode_enabled as boolean | null}
        toggleLabel={config.influence_toggle_label}
      />
    </div>
  )
}
