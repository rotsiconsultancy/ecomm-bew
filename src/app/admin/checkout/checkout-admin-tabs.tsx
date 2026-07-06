'use client'

import { useState, useTransition } from 'react'
import { Loader2, Save, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CheckoutConfig, PaymentMethod, PostPurchasePrompt, CompanionRule, InfluenceIntensity } from '@/types/checkout'
import {
  saveCheckoutConfigAction,
  savePaymentMethodAction,
  savePostPurchasePromptAction,
  saveCompanionRuleAction,
  addCompanionRuleAction,
  deleteCompanionRuleAction,
} from './actions'

// ─── Reusable Toggle (settings-tabs pattern) ─────────────────────────────────

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none min-w-0">
      <button
        type="button"
        onClick={() => onChange(!on)}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative overflow-hidden ${on ? 'bg-[#061f3f]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className="text-sm font-medium text-gray-700 leading-snug">{label}</span>
    </label>
  )
}

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = 'influence' | 'payments' | 'post_purchase' | 'companions'

const TABS: { key: Tab; label: string }[] = [
  { key: 'influence', label: 'Influence' },
  { key: 'payments', label: 'Payment Methods' },
  { key: 'post_purchase', label: 'Post-Purchase' },
  { key: 'companions', label: 'Companions' },
]

interface Props {
  config: CheckoutConfig
  methods: PaymentMethod[]
  prompts: PostPurchasePrompt[]
  rules: CompanionRule[]
  categories: string[]
  credentialsStatus: Record<string, boolean>
}

export function CheckoutAdminTabs({ config, methods, prompts, rules, categories, credentialsStatus }: Props) {
  const [tab, setTab] = useState<Tab>('influence')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-bold transition-all ${
              tab === t.key
                ? 'bg-white text-[#061f3f] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'influence' && <InfluenceTab config={config} />}
      {tab === 'payments' && <PaymentsTab methods={methods} credentialsStatus={credentialsStatus} />}
      {tab === 'post_purchase' && <PostPurchaseTab prompts={prompts} />}
      {tab === 'companions' && <CompanionsTab rules={rules} categories={categories} />}
    </div>
  )
}

// ─── Influence Tab ───────────────────────────────────────────────────────────

function InfluenceTab({ config }: { config: CheckoutConfig }) {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  const [retailDefault, setRetailDefault] = useState(config.influence_default_retail)
  const [wholesaleDefault, setWholesaleDefault] = useState(config.influence_default_wholesale)
  const [intensity, setIntensity] = useState<InfluenceIntensity>(config.influence_intensity)
  const [showCompanions, setShowCompanions] = useState(config.show_companions)
  const [showScarcity, setShowScarcity] = useState(config.show_scarcity)
  const [showSocialProof, setShowSocialProof] = useState(config.show_social_proof)
  const [showPointsOverlay, setShowPointsOverlay] = useState(config.show_points_overlay)
  const [showStreak, setShowStreak] = useState(config.show_streak_reminder)
  const [showBundle, setShowBundle] = useState(config.show_bundle_framing)
  const [toggleLabel, setToggleLabel] = useState(config.influence_toggle_label)

  function handleSave() {
    setMsg(null)
    startTransition(async () => {
      const result = await saveCheckoutConfigAction({
        influence_default_retail: retailDefault,
        influence_default_wholesale: wholesaleDefault,
        influence_intensity: intensity,
        show_companions: showCompanions,
        show_scarcity: showScarcity,
        show_social_proof: showSocialProof,
        show_points_overlay: showPointsOverlay,
        show_streak_reminder: showStreak,
        show_bundle_framing: showBundle,
        influence_toggle_label: toggleLabel,
      })
      setMsg(result.success ? 'Saved!' : result.error ?? 'Failed')
    })
  }

  const INTENSITY_DESC: Record<InfluenceIntensity, string> = {
    low: 'Companion products only — no scarcity or social proof badges',
    medium: 'Companions + scarcity + social proof',
    high: 'Everything — companions, scarcity, social proof, streak reminders, bundle framing',
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="font-bold text-lg text-[#061f3f]">Global Defaults</h3>
        <Toggle on={retailDefault} onChange={setRetailDefault} label="Enable influence for Retail customers" />
        <Toggle on={wholesaleDefault} onChange={setWholesaleDefault} label="Enable influence for Wholesale customers" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="font-bold text-lg text-[#061f3f]">Intensity</h3>
        <div className="flex gap-3">
          {(['low', 'medium', 'high'] as InfluenceIntensity[]).map((level) => (
            <button
              key={level}
              onClick={() => setIntensity(level)}
              className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold capitalize transition-all ${
                intensity === level
                  ? 'border-[#ff5f14] bg-[#ff5f14]/5 text-[#061f3f]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{INTENSITY_DESC[intensity]}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-lg text-[#061f3f]">Element Toggles</h3>
        <Toggle on={showCompanions} onChange={setShowCompanions} label="Companion product suggestions" />
        <Toggle on={showScarcity} onChange={setShowScarcity} label="Low stock scarcity badges" />
        <Toggle on={showSocialProof} onChange={setShowSocialProof} label="Social proof (orders this month)" />
        <Toggle on={showPointsOverlay} onChange={setShowPointsOverlay} label="Points overlay on companions" />
        <Toggle on={showStreak} onChange={setShowStreak} label="Login streak reminder" />
        <Toggle on={showBundle} onChange={setShowBundle} label="Bundle framing bonus" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h3 className="font-bold text-lg text-[#061f3f]">User Toggle Label</h3>
        <p className="text-xs text-gray-400">What users see in their account settings</p>
        <Input
          value={toggleLabel}
          onChange={(e) => setToggleLabel(e.target.value)}
          className="h-11"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#061f3f] hover:bg-[#03152d] text-white font-bold"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Influence Config
        </Button>
        {msg && (
          <span className={`text-sm font-bold ${msg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Payments Tab ────────────────────────────────────────────────────────────

function PaymentsTab({ methods, credentialsStatus }: { methods: PaymentMethod[]; credentialsStatus: Record<string, boolean> }) {
  const [isPending, startTransition] = useTransition()
  const [local, setLocal] = useState(methods)
  const [msg, setMsg] = useState<Record<string, string>>({})

  function update(id: string, field: string, value: unknown) {
    setLocal((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  function handleSave(method: PaymentMethod) {
    setMsg((prev) => ({ ...prev, [method.id]: '' }))
    startTransition(async () => {
      const result = await savePaymentMethodAction(method.id, {
        label: method.label,
        is_active: method.is_active,
        sort_order: method.sort_order,
        min_order_amount: method.min_order_amount,
        allowed_tiers: method.allowed_tiers,
      })
      setMsg((prev) => ({
        ...prev,
        [method.id]: result.success ? 'Saved!' : result.error ?? 'Failed',
      }))
    })
  }

  const TIERS = ['customer', 'wholesale', 'admin', 'staff']

  return (
    <div className="space-y-4">
      {local.map((method) => {
        const hasCreds = credentialsStatus[method.method_key] ?? false
        return (
        <div key={method.id} className={`bg-white rounded-xl border p-5 space-y-4 ${!hasCreds ? 'border-amber-300' : 'border-gray-200'}`}>
          {!hasCreds && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-lg px-3 py-2 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>No credentials configured — set up in <strong>Settings → Credentials</strong> before enabling.</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                {method.method_key}
              </span>
              <Toggle
                on={method.is_active && hasCreds}
                onChange={(v) => {
                  if (!hasCreds && v) return // prevent enabling without credentials
                  update(method.id, 'is_active', v)
                }}
                label={method.is_active && hasCreds ? 'Active' : 'Disabled'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Display Label</label>
              <Input
                value={method.label}
                onChange={(e) => update(method.id, 'label', e.target.value)}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Min Order (KES)</label>
              <Input
                type="number"
                value={method.min_order_amount}
                onChange={(e) => update(method.id, 'min_order_amount', Number(e.target.value))}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Sort Order</label>
              <Input
                type="number"
                value={method.sort_order}
                onChange={(e) => update(method.id, 'sort_order', Number(e.target.value))}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Allowed Tiers</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TIERS.map((tier) => {
                  const selected = method.allowed_tiers.includes(tier as never)
                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        const next = selected
                          ? method.allowed_tiers.filter((t) => t !== tier)
                          : [...method.allowed_tiers, tier]
                        update(method.id, 'allowed_tiers', next)
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        selected
                          ? 'bg-[#061f3f] text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {tier}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => handleSave(method)}
              disabled={isPending}
              className="bg-[#061f3f] hover:bg-[#03152d] text-white font-bold"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
            </Button>
            {msg[method.id] && (
              <span className={`text-xs font-bold ${msg[method.id] === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                {msg[method.id]}
              </span>
            )}
          </div>
        </div>
        )
      })}
    </div>
  )
}

// ─── Post-Purchase Tab ───────────────────────────────────────────────────────

function PostPurchaseTab({ prompts }: { prompts: PostPurchasePrompt[] }) {
  const [isPending, startTransition] = useTransition()
  const [local, setLocal] = useState(prompts)
  const [msg, setMsg] = useState<Record<string, string>>({})

  function update(id: string, field: string, value: unknown) {
    setLocal((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  function handleSave(prompt: PostPurchasePrompt) {
    setMsg((prev) => ({ ...prev, [prompt.id]: '' }))
    startTransition(async () => {
      const result = await savePostPurchasePromptAction(prompt.id, {
        copy_text: prompt.copy_text,
        points_value: prompt.points_value,
        is_active: prompt.is_active,
        trigger_timing: prompt.trigger_timing,
      })
      setMsg((prev) => ({
        ...prev,
        [prompt.id]: result.success ? 'Saved!' : result.error ?? 'Failed',
      }))
    })
  }

  return (
    <div className="space-y-4">
      {local.map((prompt) => (
        <div key={prompt.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
              {prompt.prompt_key}
            </span>
            <Toggle
              on={prompt.is_active}
              onChange={(v) => update(prompt.id, 'is_active', v)}
              label={prompt.is_active ? 'Active' : 'Disabled'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Copy Text</label>
              <Input
                value={prompt.copy_text}
                onChange={(e) => update(prompt.id, 'copy_text', e.target.value)}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Points Value</label>
              <Input
                type="number"
                value={prompt.points_value}
                onChange={(e) => update(prompt.id, 'points_value', Number(e.target.value))}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Trigger Timing</label>
              <div className="flex gap-2 mt-2">
                {(['immediate', 'after_delivery'] as const).map((timing) => (
                  <button
                    key={timing}
                    onClick={() => update(prompt.id, 'trigger_timing', timing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      prompt.trigger_timing === timing
                        ? 'bg-[#061f3f] text-white'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {timing === 'immediate' ? 'Immediate' : 'After Delivery'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => handleSave(prompt)}
              disabled={isPending}
              className="bg-[#061f3f] hover:bg-[#03152d] text-white font-bold"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
            </Button>
            {msg[prompt.id] && (
              <span className={`text-xs font-bold ${msg[prompt.id] === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                {msg[prompt.id]}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Companions Tab ──────────────────────────────────────────────────────────

function CompanionsTab({ rules, categories }: { rules: CompanionRule[]; categories: string[] }) {
  const [isPending, startTransition] = useTransition()
  const [local, setLocal] = useState(rules)
  const [msg, setMsg] = useState<Record<string, string>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newRule, setNewRule] = useState({
    source_category: '',
    target_category: '',
    reason_copy: '',
    points_multiplier: 2.0,
    display_limit: 2,
  })

  function update(id: string, field: string, value: unknown) {
    setLocal((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  function handleSave(rule: CompanionRule) {
    setMsg((prev) => ({ ...prev, [rule.id]: '' }))
    startTransition(async () => {
      const result = await saveCompanionRuleAction(rule.id, {
        source_category: rule.source_category,
        target_category: rule.target_category,
        reason_copy: rule.reason_copy,
        points_multiplier: rule.points_multiplier,
        display_limit: rule.display_limit,
        is_active: rule.is_active,
      })
      setMsg((prev) => ({
        ...prev,
        [rule.id]: result.success ? 'Saved!' : result.error ?? 'Failed',
      }))
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this companion rule?')) return
    startTransition(async () => {
      await deleteCompanionRuleAction(id)
      setLocal((prev) => prev.filter((r) => r.id !== id))
    })
  }

  function handleAdd() {
    if (!newRule.source_category || !newRule.target_category) return
    startTransition(async () => {
      const result = await addCompanionRuleAction(newRule)
      if (result.success) {
        setShowAdd(false)
        setNewRule({ source_category: '', target_category: '', reason_copy: '', points_multiplier: 2.0, display_limit: 2 })
        setMsg((prev) => ({ ...prev, _new: 'Added! Refresh to see.' }))
      }
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Category-level rules: when a customer has products from the source category in cart,
        suggest products from the target category during checkout.
      </p>

      {local.map((rule) => (
        <div key={rule.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Toggle
              on={rule.is_active}
              onChange={(v) => update(rule.id, 'is_active', v)}
              label={rule.is_active ? 'Active' : 'Disabled'}
            />
            <button
              onClick={() => handleDelete(rule.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Source Category</label>
              <select
                value={rule.source_category}
                onChange={(e) => update(rule.id, 'source_category', e.target.value)}
                className="mt-1 w-full h-10 px-3 border border-input rounded-md text-sm bg-white"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Target Category</label>
              <select
                value={rule.target_category}
                onChange={(e) => update(rule.id, 'target_category', e.target.value)}
                className="mt-1 w-full h-10 px-3 border border-input rounded-md text-sm bg-white"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Reason Copy</label>
              <Input
                value={rule.reason_copy}
                onChange={(e) => update(rule.id, 'reason_copy', e.target.value)}
                placeholder='e.g. "Contractors who buy silicone without a gun waste 30%"'
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Points Multiplier</label>
              <Input
                type="number"
                step="0.1"
                value={rule.points_multiplier}
                onChange={(e) => update(rule.id, 'points_multiplier', Number(e.target.value))}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Display Limit</label>
              <Input
                type="number"
                value={rule.display_limit}
                onChange={(e) => update(rule.id, 'display_limit', Number(e.target.value))}
                className="h-10 mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => handleSave(rule)}
              disabled={isPending}
              className="bg-[#061f3f] hover:bg-[#03152d] text-white font-bold"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
            </Button>
            {msg[rule.id] && (
              <span className={`text-xs font-bold ${msg[rule.id] === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                {msg[rule.id]}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Add new rule */}
      {showAdd ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-[#ff5f14]/30 p-5 space-y-4">
          <h4 className="font-bold text-sm text-[#061f3f]">New Companion Rule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Source Category</label>
              <select
                value={newRule.source_category}
                onChange={(e) => setNewRule((n) => ({ ...n, source_category: e.target.value }))}
                className="mt-1 w-full h-10 px-3 border border-input rounded-md text-sm bg-white"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Target Category</label>
              <select
                value={newRule.target_category}
                onChange={(e) => setNewRule((n) => ({ ...n, target_category: e.target.value }))}
                className="mt-1 w-full h-10 px-3 border border-input rounded-md text-sm bg-white"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Reason Copy</label>
              <Input
                value={newRule.reason_copy}
                onChange={(e) => setNewRule((n) => ({ ...n, reason_copy: e.target.value }))}
                placeholder='e.g. "Contractors who buy silicone without a gun waste 30%"'
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Points Multiplier</label>
              <Input
                type="number"
                step="0.1"
                value={newRule.points_multiplier}
                onChange={(e) => setNewRule((n) => ({ ...n, points_multiplier: Number(e.target.value) }))}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Display Limit</label>
              <Input
                type="number"
                value={newRule.display_limit}
                onChange={(e) => setNewRule((n) => ({ ...n, display_limit: Number(e.target.value) }))}
                className="h-10 mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={isPending || !newRule.source_category || !newRule.target_category}
              className="bg-[#ff5f14] hover:bg-[#e84f0a] text-white font-bold"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add Rule'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            {msg._new && <span className="text-xs font-bold text-green-600">{msg._new}</span>}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:border-[#ff5f14] hover:text-[#ff5f14] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Companion Rule
        </button>
      )}
    </div>
  )
}
