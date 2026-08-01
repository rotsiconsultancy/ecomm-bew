import Link from 'next/link'
import type { ElementType, ReactNode } from 'react'
import { AlertTriangle, Bell, BellRing, Building2, CheckCircle2, ChevronRight, CircleAlert, ClipboardList, Clock3, LayoutDashboard, Mail, MapPin, Package, Settings2, ShoppingBag, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createServiceClient } from '@/lib/supabase/server'
import { getSupplierContext } from '@/lib/suppliers'
import { SUPPLIER_MEMBER_ROLES } from '@/types/supplier'
import {
  updateSupplierCompany,
  updateSupplierFulfilmentStatus,
  updateSupplierMember,
} from './actions'
import { DeliveryRuleDialog, NotificationDialog, ProductEditorDialog, StaffInviteDialog } from './portal-dialogs'
import { FormSubmitButton } from './form-submit-button'
import SupplierProductWorkbench, { type SupplierManagedProduct } from './supplier-product-workbench'
import { SUPPLIER_NOTIFICATION_EVENTS } from '@/types/supplier'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ tab?: string }> }

const TABS = [
  ['dashboard', 'Overview', LayoutDashboard],
  ['products', 'Products', Package],
  ['orders', 'Orders', ShoppingBag],
  ['staff', 'Team', Users],
  ['delivery', 'Delivery', MapPin],
  ['notifications', 'Notifications', Bell],
  ['company', 'Company profile', Building2],
  ['package', 'Plan & limits', Settings2],
] as const

type FormAction = (formData: FormData) => void | Promise<void>

function asFormAction(action: unknown): FormAction {
  return action as FormAction
}

export default async function SupplierPortalPage({ searchParams }: Props) {
  const params = await searchParams
  const tab = params.tab ?? 'dashboard'
  const ctx = await getSupplierContext()

  if (!ctx) {
    return (
      <main className="min-h-screen bg-[#f6f8fb] px-4 py-16">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <h1 className="text-2xl font-black text-[#061f3f]">Supplier access required</h1>
          <p className="mt-2 text-sm font-semibold text-gray-500">Apply to become a supplier or accept an invite to access the portal.</p>
          <Link href="/become-supplier" className="mt-5 inline-flex h-11 items-center rounded-lg bg-[#ff5f14] px-5 text-sm font-black text-white">
            Become a supplier
          </Link>
        </Card>
      </main>
    )
  }

  const supabase = await createServiceClient()
  const [
    { data: members },
    { data: regions },
    { data: rules },
    { data: notifications },
    { data: logs },
    { data: products },
    { data: fulfilments },
  ] = await Promise.all([
    supabase.from('supplier_members').select('*').eq('supplier_id', ctx.supplier.id).order('created_at', { ascending: false }),
    supabase.from('delivery_regions').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('supplier_delivery_rules').select('*, delivery_regions(*)').eq('supplier_id', ctx.supplier.id).order('created_at', { ascending: false }),
    supabase.from('supplier_notification_emails').select('*').eq('supplier_id', ctx.supplier.id).order('created_at', { ascending: false }),
    supabase.from('supplier_notification_logs').select('*').eq('supplier_id', ctx.supplier.id).order('created_at', { ascending: false }).limit(25),
    supabase.from('products').select('*').eq('supplier_id', ctx.supplier.id).order('created_at', { ascending: false }),
    supabase.from('supplier_fulfilments').select('*, orders(shipping_address, created_at)').eq('supplier_id', ctx.supplier.id).order('created_at', { ascending: false }),
  ])

  const memberRows = members ?? []
  const regionRows = regions ?? []
  const ruleRows = rules ?? []
  const notificationRows = notifications ?? []
  const logRows = logs ?? []
  const productRows = products ?? []
  const fulfilmentRows = fulfilments ?? []

  const checklist = [
    ['Complete company profile', Boolean(ctx.supplier.primary_contact_name && ctx.supplier.phone && ctx.supplier.location), 'company'],
    ['Set delivery regions', ruleRows.some((r) => r.is_active), 'delivery'],
    ['Add notification recipient', notificationRows.some((n) => n.is_active), 'notifications'],
    ['Add your first product', productRows.length > 0, 'products'],
    ['Publish a product', productRows.some((p) => p.is_active && p.product_status === 'active'), 'products'],
  ] as const
  const completedChecklistItems = checklist.filter(([, done]) => done).length

  if (ctx.supplier.status === 'suspended') {
    return (
      <PortalShell supplierName={ctx.supplier.company_name} tab={tab}>
        <Card className="border-red-200 bg-red-50 p-8">
          <AlertTriangle className="mb-3 h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-black text-red-900">Supplier account suspended</h1>
          <p className="mt-2 text-sm font-semibold text-red-700">{ctx.supplier.suspension_reason ?? 'Contact Bewama for assistance.'}</p>
        </Card>
      </PortalShell>
    )
  }

  return (
    <PortalShell supplierName={ctx.supplier.company_name} tab={tab}>
      {tab === 'dashboard' && (
        <div className="grid gap-5">
          <div><h2 className="text-2xl font-black text-[#061f3f]">Welcome back</h2><p className="mt-1 text-sm font-semibold text-[#728196]">Here’s what needs your attention across the supplier account.</p></div>
          <div className="grid gap-4 md:grid-cols-4">
            <Stat icon={Package} label="Products" value={productRows.length} />
            <Stat icon={ClipboardList} label="Fulfilments" value={fulfilmentRows.length} />
            <Stat icon={Users} label="Staff" value={memberRows.filter((m) => m.status === 'active').length} />
            <Stat icon={Truck} label="Delivery rules" value={ruleRows.filter((r) => r.is_active).length} />
          </div>
          <Card className="p-5">
            <div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-black text-[#061f3f]">Get ready to sell</h2><p className="mt-1 text-sm font-semibold text-[#728196]">Complete these essentials before taking orders.</p></div><span className="shrink-0 text-sm font-black text-[#061f3f]">{completedChecklistItems}/{checklist.length}</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7ecf1]"><div className="h-full rounded-full bg-[#ff5f14]" style={{ width: `${(completedChecklistItems / checklist.length) * 100}%` }} /></div>
            <div className="mt-4 grid gap-2">
              {checklist.map(([label, done, destination]) => (
                <Link key={label} href={`/supplier-portal?tab=${destination}`} className="flex items-center justify-between rounded-lg bg-[#f7f9fb] px-4 py-3 text-sm transition-colors hover:bg-[#eef2f6]">
                  <span className="flex items-center gap-3 font-bold text-[#061f3f]"><span className={`grid h-6 w-6 place-items-center rounded-full ${done ? 'bg-green-100 text-green-700' : 'border border-[#ccd5df] bg-white text-[#8a97a8]'}`}>{done ? <span>✓</span> : <span className="text-[10px]">{checklist.findIndex(([item]) => item === label) + 1}</span>}</span>{label}</span>
                  <span className={done ? 'font-black text-green-600' : 'font-black text-[#ff5f14]'}>{done ? 'Done' : 'Set up'}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid gap-5">
          <SectionHeading title="Products" description="Manage what buyers can discover and order from your company." action={<ProductEditorDialog />} />
          {productRows.length > 0
            ? <SupplierProductWorkbench products={productRows as SupplierManagedProduct[]} />
            : <Card><EmptyState icon={Package} title="No products yet" description="Add your first product to start building your supplier catalog." action={<ProductEditorDialog />} /></Card>}
        </div>
      )}

      {tab === 'orders' && (
        <div className="grid gap-5">
          <SectionHeading title="Orders" description="Review incoming fulfilments and keep customers updated as orders progress." action={<span className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#061f3f]">{fulfilmentRows.length} total</span>} />
        <Card className="p-5">
          <div className="grid gap-3">
            {fulfilmentRows.map((fulfilment) => {
              const addr = fulfilment.orders?.shipping_address as { full_name?: string; city?: string } | null
              const items = Array.isArray(fulfilment.items) ? fulfilment.items : []
              return (
                <div key={fulfilment.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-black text-[#061f3f]">Order {fulfilment.order_id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm font-semibold text-gray-500">{addr?.full_name ?? 'Customer'} · {addr?.city ?? 'Delivery'}</p>
                      <p className="mt-1 text-xs font-bold text-gray-400">{items.length} item(s) · KES {Number(fulfilment.subtotal_amount).toLocaleString()}</p>
                      {fulfilment.rejected_reason && <p className="mt-2 text-xs font-bold text-red-600">{fulfilment.rejected_reason}</p>}
                    </div>
                    <form action={asFormAction(updateSupplierFulfilmentStatus.bind(null, fulfilment.id))} className="grid min-w-64 gap-2">
                      <select name="status" defaultValue={fulfilment.status} className="h-10 rounded-md border px-3 text-sm">
                        {['accepted', 'rejected', 'preparing', 'ready', 'dispatched', 'delivered'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Input name="rejected_reason" placeholder="Reason if rejecting" />
                      <FormSubmitButton idleLabel="Update order" pendingLabel="Updating order…" variant="outline" />
                    </form>
                  </div>
                </div>
              )
            })}
            {fulfilmentRows.length === 0 && <p className="text-sm font-semibold text-gray-400">No fulfilments yet.</p>}
          </div>
        </Card>
        </div>
      )}

      {tab === 'staff' && (
        <div className="grid gap-5">
          <SectionHeading title="Team access" description="Control who can manage products, orders, and company settings." action={<StaffInviteDialog />} />
          <Card className="p-5">
            <div className="grid gap-2">
              {memberRows.map((member) => (
                <form key={member.id} action={asFormAction(updateSupplierMember.bind(null, member.id))} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_180px_130px_100px]">
                  <div>
                    <p className="font-bold text-[#061f3f]">{member.email}</p>
                    <p className="text-xs font-semibold text-gray-400">{member.status}</p>
                  </div>
                  <select name="member_role" defaultValue={member.member_role} className="h-10 rounded-md border px-3 text-sm">
                    {SUPPLIER_MEMBER_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                  </select>
                  <select name="status" defaultValue={member.status} className="h-10 rounded-md border px-3 text-sm">
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="removed">Removed</option>
                  </select>
                  <FormSubmitButton idleLabel="Save member" pendingLabel="Saving member…" variant="outline" />
                </form>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'delivery' && (
        <div className="grid gap-5">
          <SectionHeading title="Delivery regions" description="Tell buyers where you deliver, what it costs, and how long it takes." action={<DeliveryRuleDialog regions={regionRows} />} />
          <Card className="p-5">
            <div className="grid gap-3">
              {ruleRows.map((rule) => (
                <div key={rule.id} className="flex flex-col gap-3 rounded-xl border border-[#e2e7ed] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="font-black text-[#061f3f]">{rule.delivery_regions?.name ?? 'Delivery region'}</h3><p className="mt-1 text-sm font-semibold text-[#728196]">KES {Number(rule.base_fee).toLocaleString()} base fee · {rule.lead_time_min_days}–{rule.lead_time_max_days} days</p></div>
                  <DeliveryRuleDialog regions={regionRows} rule={rule} />
                </div>
              ))}
              {ruleRows.length === 0 && <EmptyState icon={Truck} title="No delivery regions" description="Add a region so customers know where you can fulfil orders." action={<DeliveryRuleDialog regions={regionRows} />} />}
            </div>
          </Card>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="grid gap-5">
          <SectionHeading title="Notification routing" description="Send each operational alert to the inbox that can act on it." action={<NotificationDialog />} />
          <Card className="overflow-hidden border-[#dce3eb] bg-[#061f3f] text-white">
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><BellRing className="h-6 w-6 text-[#ff7a3d]" /></div>
              <div>
                <h2 className="text-lg font-black">How notification routing works</h2>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-white/70">Choose an inbox, select the events it owns, and Bewama emails that recipient when an event occurs. You can pause an inbox without losing its setup.</p>
              </div>
              <div className="flex gap-5 text-sm">
                <div><p className="text-2xl font-black">{notificationRows.filter((row) => row.is_active).length}</p><p className="font-bold text-white/60">active inboxes</p></div>
                <div><p className="text-2xl font-black">{SUPPLIER_NOTIFICATION_EVENTS.length}</p><p className="font-bold text-white/60">alert types</p></div>
              </div>
            </div>
          </Card>
          <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
            <Card className="p-5">
              <div className="mb-4"><h2 className="text-lg font-black text-[#061f3f]">Recipient inboxes</h2><p className="mt-1 text-sm font-semibold text-[#728196]">Who receives which alerts.</p></div>
              <div className="grid gap-2">
                {notificationRows.map((n) => {
                  const selectedEvents = SUPPLIER_NOTIFICATION_EVENTS.filter((event) => (n.events ?? []).includes(event.value))
                  return (
                    <div key={n.id} className="rounded-xl border border-[#e2e7ed] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${n.is_active ? 'bg-[#fff1e8] text-[#e84f0a]' : 'bg-[#eef2f6] text-[#8a97a8]'}`}><Mail className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2"><p className="font-black text-[#061f3f]">{n.label}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${n.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{n.is_active ? 'Sending' : 'Paused'}</span></div>
                            <p className="mt-1 truncate text-sm font-semibold text-[#728196]">{n.email}</p>
                          </div>
                        </div>
                        <NotificationDialog recipient={n} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedEvents.map((event) => <span key={event.value} className="rounded-md bg-[#f4f7fa] px-2 py-1 text-xs font-bold text-[#526173]">{event.label}</span>)}
                        {selectedEvents.length === 0 && <span className="text-xs font-bold text-amber-700">No alerts selected</span>}
                      </div>
                    </div>
                  )
                })}
                {notificationRows.length === 0 && <EmptyState icon={Mail} title="No notification inboxes" description="Add an inbox and choose the alerts it should receive." action={<NotificationDialog />} />}
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-4"><h2 className="text-lg font-black text-[#061f3f]">Recent delivery activity</h2><p className="mt-1 text-sm font-semibold text-[#728196]">The latest emails Bewama attempted to send.</p></div>
              <div className="grid gap-2">
                {logRows.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg bg-[#f7f9fb] px-3 py-3 text-xs">
                    <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${log.status === 'sent' ? 'bg-green-100 text-green-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {log.status === 'sent' ? <CheckCircle2 className="h-3.5 w-3.5" /> : log.status === 'failed' ? <CircleAlert className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0"><p className="font-black text-[#061f3f]">{notificationEventLabel(log.event_key)}</p><p className="mt-1 truncate font-semibold text-[#728196]">{log.recipient_email} · {log.status}</p></div>
                  </div>
                ))}
                {logRows.length === 0 && <p className="rounded-lg bg-[#f7f9fb] p-4 text-sm font-semibold leading-6 text-[#728196]">No alerts have been sent yet. Delivery activity will appear here after the first notification.</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'company' && (
        <div className="grid gap-5"><SectionHeading title="Company profile" description="Keep the business details shown to Bewama and used for supplier communication accurate." action={<span />} /><Card className="max-w-3xl p-5 sm:p-6">
          <form action={asFormAction(updateSupplierCompany)} className="grid gap-4 sm:grid-cols-2">
            <LabeledInput label="Primary contact" name="primary_contact_name" defaultValue={ctx.supplier.primary_contact_name} />
            <LabeledInput label="Phone number" name="phone" defaultValue={ctx.supplier.phone} />
            <LabeledInput label="Business location" name="location" defaultValue={ctx.supplier.location ?? ''} />
            <LabeledInput label="Website" name="website_url" type="url" defaultValue={ctx.supplier.website_url ?? ''} />
            <LabeledInput label="Product categories" name="product_categories" defaultValue={(ctx.supplier.product_categories ?? []).join(', ')} className="sm:col-span-2" />
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-wider text-[#526173] sm:col-span-2">Business description<textarea name="business_description" defaultValue={ctx.supplier.business_description ?? ''} className="min-h-28 rounded-lg border border-[#d8e0ea] px-3 py-2 text-sm outline-none focus:border-[#ff5f14]" rows={4} /></label>
            <div className="sm:col-span-2"><FormSubmitButton idleLabel="Save company profile" pendingLabel="Saving company profile…" className="bg-[#ff5f14] text-white hover:bg-[#e84f0a]" /></div>
          </form>
        </Card></div>
      )}

      {tab === 'package' && (
        <Card className="max-w-xl p-6">
          <h2 className="text-2xl font-black text-[#061f3f]">{ctx.package?.name ?? ctx.supplier.package_key}</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">{ctx.package?.description ?? 'Supplier package'}</p>
          {ctx.package && (
            <div className="mt-5 grid gap-2 text-sm">
              <Limit label="Staff users" value={ctx.package.max_staff} />
              <Limit label="Active products" value={ctx.package.max_active_products} />
              <Limit label="Images per product" value={ctx.package.max_product_images} />
              <Limit label="Analytics" value={ctx.package.analytics_level} />
            </div>
          )}
        </Card>
      )}
    </PortalShell>
  )
}

function PortalShell({ supplierName, tab, children }: { supplierName: string; tab: string; children: React.ReactNode }) {
  const currentTab = TABS.find(([key]) => key === tab) ?? TABS[0]
  return (
    <main className="min-h-screen bg-[#f4f7fa] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-[#dce3eb] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Supplier Portal</p>
            <h1 className="mt-1 text-2xl font-black text-[#061f3f] sm:text-3xl">{supplierName}</h1>
          </div>
          <Button asChild variant="outline" className="w-fit bg-white font-black text-[#061f3f]"><Link href="/products">View live catalog <ChevronRight /></Link></Button>
        </header>

        <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden" aria-label="Supplier portal">
          {TABS.map(([key, label, Icon]) => <Link key={key} href={`/supplier-portal?tab=${key}`} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-black ${tab === key ? 'bg-[#061f3f] text-white' : 'border border-[#dce3eb] bg-white text-[#526173]'}`}><Icon className="h-4 w-4" />{label}</Link>)}
        </nav>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <nav className="sticky top-28 grid gap-1" aria-label="Supplier portal">
              {TABS.map(([key, label, Icon]) => <Link key={key} href={`/supplier-portal?tab=${key}`} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black transition-colors ${tab === key ? 'bg-[#061f3f] text-white shadow-sm' : 'text-[#526173] hover:bg-white hover:text-[#061f3f]'}`}><Icon className={`h-4 w-4 ${tab === key ? 'text-[#ff7a3d]' : ''}`} />{label}</Link>)}
            </nav>
          </aside>
          <section className="min-w-0">
            {tab !== 'dashboard' && <div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#8a97a8]">{currentTab[1]}</p></div>}
            {children}
          </section>
        </div>
      </div>
    </main>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="p-5">
      <Icon className="mb-3 h-6 w-6 text-[#ff5f14]" />
      <p className="text-2xl font-black text-[#061f3f]">{value}</p>
      <p className="text-sm font-bold text-gray-400">{label}</p>
    </Card>
  )
}

function SectionHeading({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-black text-[#061f3f]">{title}</h2><p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#728196]">{description}</p></div><div className="shrink-0">{action}</div></div>
}

function EmptyState({ icon: Icon, title, description, action }: { icon: ElementType; title: string; description: string; action: ReactNode }) {
  return <div className="grid place-items-center px-6 py-14 text-center"><div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#eef2f6]"><Icon className="h-6 w-6 text-[#728196]" /></div><h3 className="text-lg font-black text-[#061f3f]">{title}</h3><p className="mb-5 mt-1 max-w-sm text-sm font-semibold leading-6 text-[#728196]">{description}</p>{action}</div>
}

function Limit({ label, value }: { label: string; value: string | number }) {
  return <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3"><span className="font-bold text-gray-500">{label}</span><span className="font-black text-[#061f3f]">{value}</span></div>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-10 rounded-md border px-3 text-sm ${props.className ?? ''}`} />
}

function LabeledInput({ label, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={`grid gap-1.5 text-xs font-black uppercase tracking-wider text-[#526173] ${className}`}>{label}<Input {...props} className="h-11 rounded-lg border-[#d8e0ea] font-semibold normal-case tracking-normal" /></label>
}

function notificationEventLabel(eventKey: string) {
  return SUPPLIER_NOTIFICATION_EVENTS.find((event) => event.value === eventKey)?.label
    ?? eventKey.replace(/^supplier_/, '').replaceAll('_', ' ')
}
