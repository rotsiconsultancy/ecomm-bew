import { getAdminContext } from '@/lib/auth'
import { getAllPointsConfig, getAdminLedger } from '@/lib/points'
import { createServiceClient } from '@/lib/supabase/server'
import { PointsAdminTabs } from './points-admin-tabs'

export default async function AdminPointsPage() {
  await getAdminContext()

  const supabase = await createServiceClient()

  const [config, ledger, usersRes] = await Promise.all([
    getAllPointsConfig(),
    getAdminLedger(),
    supabase.from('profiles').select('id, full_name').order('full_name'),
  ])

  const users = (usersRes.data ?? []).map((u) => ({
    id: u.id as string,
    full_name: (u.full_name as string | null) ?? 'Unknown',
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Points Management</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure rewards, grant points, and review all activity.
        </p>
      </div>

      <PointsAdminTabs config={config} ledger={ledger} users={users} />
    </div>
  )
}
