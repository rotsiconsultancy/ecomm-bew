import { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { getAllSettings } from '@/lib/settings'
import { Card } from '@/components/ui/card'
import { SettingsTabs } from './settings-tabs'

export const metadata: Metadata = { title: 'Settings | Bewama Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdmin()
  const settings = await getAllSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#003366]">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your store, credentials, logistics, and notifications.</p>
      </div>

      <Card className="rounded-2xl border-none shadow-sm p-6">
        <SettingsTabs settings={settings} />
      </Card>
    </div>
  )
}
