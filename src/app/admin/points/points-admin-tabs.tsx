'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings2, Gift, Activity, CheckCircle2, AlertCircle,
  Loader2, Search, Plus, Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { PointsConfig, PointsLedger } from '@/types/points'
import {
  updatePointsConfigAction,
  addPointsConfigAction,
  deletePointsConfigAction,
  adminGrantPointsAction,
  searchUsersAction,
  fetchAdminLedgerAction,
} from './actions'

interface Props {
  config: PointsConfig[]
  ledger: (PointsLedger & { user_name: string; user_email: string })[]
  users: { id: string; full_name: string }[]
}

const TABS = [
  { key: 'configure', label: 'Configure', icon: Settings2 },
  { key: 'grant', label: 'Manual Grant', icon: Gift },
  { key: 'activity', label: 'Activity', icon: Activity },
] as const

type TabKey = (typeof TABS)[number]['key']

export function PointsAdminTabs({ config, ledger: initialLedger, users }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('configure')

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-white text-[#061f3f] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'configure' && <ConfigureTab config={config} />}
      {activeTab === 'grant' && <GrantTab users={users} />}
      {activeTab === 'activity' && <ActivityTab initialLedger={initialLedger} />}
    </div>
  )
}

// ─── Configure Tab ───────────────────────────────────────────────────────────

function ConfigureTab({ config }: { config: PointsConfig[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, { success: boolean; msg: string }>>({})

  // Add-new form state
  const [showAdd, setShowAdd] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newPoints, setNewPoints] = useState('')
  const [addFeedback, setAddFeedback] = useState<{ success: boolean; msg: string } | null>(null)

  // Local editable state
  const [edits, setEdits] = useState<Record<string, { points_value: number; is_active: boolean }>>(
    Object.fromEntries(config.map((c) => [c.id, { points_value: c.points_value, is_active: c.is_active }]))
  )

  function handleSave(id: string) {
    const edit = edits[id]
    if (!edit) return
    setSavingId(id)
    startTransition(async () => {
      const result = await updatePointsConfigAction(id, edit.points_value, edit.is_active)
      setFeedback((prev) => ({
        ...prev,
        [id]: { success: result.success, msg: result.success ? 'Saved' : result.error ?? 'Failed' },
      }))
      setSavingId(null)
      router.refresh()
    })
  }

  function handleDelete(id: string, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    setDeletingId(id)
    startTransition(async () => {
      const result = await deletePointsConfigAction(id)
      if (!result.success) {
        setFeedback((prev) => ({ ...prev, [id]: { success: false, msg: result.error ?? 'Failed' } }))
      }
      setDeletingId(null)
      router.refresh()
    })
  }

  function handleAdd() {
    if (!newKey.trim() || !newLabel.trim()) return
    setAddFeedback(null)
    startTransition(async () => {
      const result = await addPointsConfigAction(newKey, newLabel, parseInt(newPoints, 10) || 0)
      setAddFeedback({
        success: result.success,
        msg: result.success ? 'Action added' : result.error ?? 'Failed',
      })
      if (result.success) {
        setNewKey('')
        setNewLabel('')
        setNewPoints('')
        setShowAdd(false)
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                <th className="text-left px-5 py-3 font-bold">Action</th>
                <th className="text-left px-5 py-3 font-bold">Key</th>
                <th className="text-left px-5 py-3 font-bold">Points</th>
                <th className="text-center px-5 py-3 font-bold">Active</th>
                <th className="text-right px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {config.map((cfg) => {
                const edit = edits[cfg.id] ?? { points_value: cfg.points_value, is_active: cfg.is_active }
                const fb = feedback[cfg.id]
                return (
                  <tr key={cfg.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-semibold text-[#061f3f]">{cfg.label}</td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="font-mono text-xs">{cfg.action_key}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Input
                        type="number"
                        min={0}
                        value={edit.points_value}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [cfg.id]: { ...edit, points_value: parseInt(e.target.value, 10) || 0 },
                          }))
                        }
                        className="h-8 w-24"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setEdits((prev) => ({
                            ...prev,
                            [cfg.id]: { ...edit, is_active: !edit.is_active },
                          }))
                        }
                        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative overflow-hidden ${
                          edit.is_active ? 'bg-[#061f3f]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            edit.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fb && (
                          <span className={`text-xs font-bold ${fb.success ? 'text-green-600' : 'text-red-500'}`}>
                            {fb.msg}
                          </span>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleSave(cfg.id)}
                          disabled={isPending && savingId === cfg.id}
                          className="bg-[#061f3f] hover:bg-[#03152d] text-white text-xs font-bold h-7 px-3"
                        >
                          {isPending && savingId === cfg.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Save'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(cfg.id, cfg.label)}
                          disabled={isPending && deletingId === cfg.id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                        >
                          {isPending && deletingId === cfg.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add new action */}
      {showAdd ? (
        <Card className="rounded-xl border-none shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#061f3f]">Add New Points Action</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Action Key</label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. birthday_bonus"
                className="h-9"
              />
              <p className="text-xs text-gray-400">Lowercase, underscores only</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Label</label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Birthday Bonus"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Points Value</label>
              <Input
                type="number"
                min={0}
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                placeholder="e.g. 100"
                className="h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAdd}
              disabled={isPending || !newKey.trim() || !newLabel.trim()}
              size="sm"
              className="bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              Add Action
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowAdd(false); setAddFeedback(null) }}
              className="text-gray-500"
            >
              Cancel
            </Button>
            {addFeedback && (
              <span className={`text-xs font-bold ${addFeedback.success ? 'text-green-600' : 'text-red-500'}`}>
                {addFeedback.msg}
              </span>
            )}
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAdd(true)}
          className="border-dashed border-gray-300 text-gray-500 hover:text-[#061f3f] hover:border-[#061f3f]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Action
        </Button>
      )}
    </div>
  )
}

// ─── Manual Grant Tab ────────────────────────────────────────────────────────

function GrantTab({ users }: { users: { id: string; full_name: string }[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ id: string; full_name: string } | null>(null)
  const [points, setPoints] = useState('')
  const [note, setNote] = useState('')
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null)

  const filtered = searchQuery.length > 0
    ? users.filter((u) =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : []

  function handleGrant() {
    if (!selectedUser) return
    const pts = parseInt(points, 10)
    if (!pts || pts <= 0) return
    setResult(null)

    startTransition(async () => {
      const res = await adminGrantPointsAction(selectedUser.id, pts, note)
      setResult({
        success: res.success,
        msg: res.success
          ? `Granted ${pts} pts to ${selectedUser.full_name}. New balance: ${res.balance}`
          : res.error ?? 'Failed',
      })
      if (res.success) {
        setPoints('')
        setNote('')
      }
      router.refresh()
    })
  }

  return (
    <Card className="rounded-xl border-none shadow-sm p-6 space-y-5">
      {/* User search */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Search User</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSelectedUser(null)
            }}
            placeholder="Type a name..."
            className="pl-9 h-10"
          />
        </div>
        {searchQuery && !selectedUser && filtered.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUser(u)
                  setSearchQuery(u.full_name)
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-none"
              >
                <span className="font-semibold text-[#061f3f]">{u.full_name}</span>
                <span className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}</span>
              </button>
            ))}
          </div>
        )}
        {selectedUser && (
          <Badge className="bg-green-100 text-green-700 border-none">
            Selected: {selectedUser.full_name}
          </Badge>
        )}
      </div>

      {/* Points + Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Points</label>
          <Input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="e.g. 500"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Note (required)</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for grant..."
            className="h-10"
          />
        </div>
      </div>

      <Button
        onClick={handleGrant}
        disabled={isPending || !selectedUser || !points || !note.trim()}
        className="bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Grant Points
      </Button>

      {result && (
        <div className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-500'}`}>
          {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {result.msg}
        </div>
      )}
    </Card>
  )
}

// ─── Activity Tab ────────────────────────────────────────────────────────────

function ActivityTab({
  initialLedger,
}: {
  initialLedger: (PointsLedger & { user_name: string; user_email: string })[]
}) {
  const [isPending, startTransition] = useTransition()
  const [ledger, setLedger] = useState(initialLedger)
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  function handleFilter() {
    startTransition(async () => {
      const data = await fetchAdminLedgerAction({
        actionKey: actionFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      setLedger(data)
    })
  }

  const actionKeys = [...new Set(initialLedger.map((r) => r.action_key))].sort()

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="rounded-xl border-none shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-[#061f3f] outline-none"
            >
              <option value="">All actions</option>
              {actionKeys.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-36"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-36"
            />
          </div>
          <Button
            onClick={handleFilter}
            disabled={isPending}
            size="sm"
            className="bg-[#061f3f] hover:bg-[#03152d] text-white font-bold h-9"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Filter'}
          </Button>
        </div>
      </Card>

      {/* Ledger table */}
      <Card className="rounded-xl border-none shadow-sm overflow-hidden">
        {ledger.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No activity found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                  <th className="text-left px-5 py-3 font-bold">User</th>
                  <th className="text-left px-5 py-3 font-bold">Action</th>
                  <th className="text-right px-5 py-3 font-bold">Points</th>
                  <th className="text-left px-5 py-3 font-bold">Note</th>
                  <th className="text-left px-5 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-semibold text-[#061f3f]">
                      {row.user_name}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="font-mono text-xs">{row.action_key}</Badge>
                    </td>
                    <td className={`px-5 py-3 text-right font-bold ${row.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.points >= 0 ? '+' : ''}{row.points}
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-50 truncate">
                      {row.note ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
