import Link from 'next/link'
import { AlertTriangle, ClipboardList, Package, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createServiceClient } from '@/lib/supabase/server'
import { getSupplierContext } from '@/lib/suppliers'
import { SUPPLIER_MEMBER_ROLES, SUPPLIER_NOTIFICATION_EVENTS } from '@/types/supplier'
import type { DeliveryRegion, SupplierDeliveryRule } from '@/types/supplier'
import {
  inviteSupplierStaff,
  saveSupplierDeliveryRule,
  saveSupplierNotificationEmail,
  saveSupplierProduct,
  updateSupplierCompany,
  updateSupplierFulfilmentStatus,
  updateSupplierMember,
} from './actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ tab?: string }> }

const TABS = [
  ['dashboard', 'Dashboard'],
  ['products', 'Products'],
  ['orders', 'Orders'],
  ['staff', 'Staff'],
  ['delivery', 'Delivery Regions'],
  ['notifications', 'Notifications'],
  ['company', 'Company Profile'],
  ['package', 'Package'],
]

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
    ['Company profile', Boolean(ctx.supplier.primary_contact_name && ctx.supplier.phone && ctx.supplier.location)],
    ['Delivery regions', ruleRows.some((r) => r.is_active)],
    ['Notification emails', notificationRows.some((n) => n.is_active)],
    ['First product', productRows.length > 0],
    ['Published product', productRows.some((p) => p.is_active && p.product_status === 'active')],
  ] as const

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
          <div className="grid gap-4 md:grid-cols-4">
            <Stat icon={Package} label="Products" value={productRows.length} />
            <Stat icon={ClipboardList} label="Fulfilments" value={fulfilmentRows.length} />
            <Stat icon={Users} label="Staff" value={memberRows.filter((m) => m.status === 'active').length} />
            <Stat icon={Truck} label="Delivery rules" value={ruleRows.filter((r) => r.is_active).length} />
          </div>
          <Card className="p-5">
            <h2 className="text-lg font-black text-[#061f3f]">Setup checklist</h2>
            <div className="mt-4 grid gap-2">
              {checklist.map(([label, done]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-bold text-[#061f3f]">{label}</span>
                  <span className={done ? 'font-black text-green-600' : 'font-black text-yellow-600'}>{done ? 'Done' : 'Needed'}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <ProductForm />
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-black text-[#061f3f]">Your products</h2>
            <div className="grid gap-3">
              {productRows.map((product) => (
                <details key={product.id} className="rounded-lg border p-3">
                  <summary className="cursor-pointer font-black text-[#061f3f]">
                    {product.name} <span className="text-xs text-gray-400">· {product.is_active ? 'Active' : 'Inactive'} · {product.product_status}</span>
                  </summary>
                  <div className="mt-4">
                    <ProductForm product={product} />
                  </div>
                </details>
              ))}
              {productRows.length === 0 && <p className="text-sm font-semibold text-gray-400">No supplier products yet.</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'orders' && (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-black text-[#061f3f]">Supplier fulfilments</h2>
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
                      <Button variant="outline" className="font-black">Update</Button>
                    </form>
                  </div>
                </div>
              )
            })}
            {fulfilmentRows.length === 0 && <p className="text-sm font-semibold text-gray-400">No fulfilments yet.</p>}
          </div>
        </Card>
      )}

      {tab === 'staff' && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="p-5">
            <h2 className="text-lg font-black text-[#061f3f]">Invite staff</h2>
            <form action={asFormAction(inviteSupplierStaff)} className="mt-4 grid gap-3">
              <Input name="email" type="email" placeholder="staff@company.com" required />
              <select name="member_role" className="h-10 rounded-md border px-3 text-sm">
                {SUPPLIER_MEMBER_ROLES.filter((r) => r.value !== 'owner').map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
              <Button className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">Send invite</Button>
            </form>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-black text-[#061f3f]">Members</h2>
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
                  <Button variant="outline">Save</Button>
                </form>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'delivery' && (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="p-5">
            <h2 className="text-lg font-black text-[#061f3f]">Add delivery rule</h2>
            <DeliveryRuleForm regions={regionRows} />
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-black text-[#061f3f]">Configured regions</h2>
            <div className="grid gap-3">
              {ruleRows.map((rule) => <DeliveryRuleForm key={rule.id} rule={rule} regions={regionRows} />)}
              {ruleRows.length === 0 && <p className="text-sm font-semibold text-gray-400">No delivery rules configured.</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="p-5">
            <h2 className="text-lg font-black text-[#061f3f]">Notification email</h2>
            <form action={asFormAction(saveSupplierNotificationEmail)} className="mt-4 grid gap-3">
              <Input name="label" placeholder="Operations team" required />
              <Input name="email" type="email" placeholder="orders@company.com" required />
              <Input name="events" placeholder={SUPPLIER_NOTIFICATION_EVENTS.map((e) => e.value).join(', ')} />
              <Button className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">Save email</Button>
            </form>
          </Card>
          <div className="grid gap-5">
            <Card className="p-5">
              <h2 className="mb-4 text-lg font-black text-[#061f3f]">Recipients</h2>
              <div className="grid gap-2">
                {notificationRows.map((n) => (
                  <form key={n.id} action={asFormAction(saveSupplierNotificationEmail)} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_100px]">
                    <input type="hidden" name="id" value={n.id} />
                    <Input name="label" defaultValue={n.label} />
                    <Input name="email" defaultValue={n.email} />
                    <Input name="events" defaultValue={(n.events ?? []).join(', ')} />
                    <Button variant="outline">Save</Button>
                  </form>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-lg font-black text-[#061f3f]">Notification log</h2>
              <div className="grid gap-2">
                {logRows.map((log) => (
                  <div key={log.id} className="rounded-lg bg-gray-50 px-3 py-2 text-xs">
                    <span className="font-black text-[#061f3f]">{log.event_key}</span>
                    <span className="text-gray-500"> · {log.recipient_email} · {log.status}</span>
                  </div>
                ))}
                {logRows.length === 0 && <p className="text-sm font-semibold text-gray-400">No notifications logged yet.</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'company' && (
        <Card className="max-w-2xl p-5">
          <h2 className="text-lg font-black text-[#061f3f]">Company profile</h2>
          <form action={asFormAction(updateSupplierCompany)} className="mt-4 grid gap-3">
            <Input name="primary_contact_name" defaultValue={ctx.supplier.primary_contact_name} />
            <Input name="phone" defaultValue={ctx.supplier.phone} />
            <Input name="location" defaultValue={ctx.supplier.location ?? ''} />
            <Input name="website_url" defaultValue={ctx.supplier.website_url ?? ''} />
            <Input name="product_categories" defaultValue={(ctx.supplier.product_categories ?? []).join(', ')} />
            <textarea name="business_description" defaultValue={ctx.supplier.business_description ?? ''} className="rounded-md border px-3 py-2 text-sm" rows={4} />
            <Button className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">Save profile</Button>
          </form>
        </Card>
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
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ff5f14]">Supplier Portal</p>
            <h1 className="mt-1 text-3xl font-black text-[#061f3f]">{supplierName}</h1>
          </div>
          <Link href="/products" className="text-sm font-black text-[#ff5f14]">View catalog</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map(([key, label]) => (
            <Link key={key} href={`/supplier-portal?tab=${key}`} className={`rounded-lg px-3 py-2 text-sm font-black ${tab === key ? 'bg-[#061f3f] text-white' : 'bg-white text-[#061f3f]'}`}>
              {label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </main>
  )
}

type SupplierProductFormValue = {
  id: string
  name: string
  slug: string
  brand: string | null
  category: string | null
  pricing_type: string | null
  price: number | string | null
  currency: string
  stock: number | null
  fulfilment_type: string | null
  supplier_sku: string | null
  weight_kg: number | string | null
  length_cm: number | string | null
  width_cm: number | string | null
  height_cm: number | string | null
  images: string[] | null
  description: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  is_active: boolean | null
}

function ProductForm({ product }: { product?: SupplierProductFormValue }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-[#061f3f]">{product ? 'Edit product' : 'Add product'}</h2>
      <form action={asFormAction(saveSupplierProduct)} className="mt-4 grid gap-3">
        {product && <input type="hidden" name="id" value={product.id} />}
        <Input name="name" placeholder="Product name" defaultValue={product?.name ?? ''} required />
        <Input name="slug" placeholder="Slug" defaultValue={product?.slug ?? ''} />
        <Input name="brand" placeholder="Brand" defaultValue={product?.brand ?? ''} required />
        <Input name="category" placeholder="Category" defaultValue={product?.category ?? ''} required />
        <select name="pricing_type" defaultValue={product?.pricing_type ?? 'fixed'} className="h-10 rounded-md border px-3 text-sm">
          <option value="fixed">Fixed price</option>
          <option value="quote">Quote only</option>
        </select>
        <Input name="price" type="number" step="0.01" placeholder="Price" defaultValue={product?.price ?? ''} />
        <Input name="currency" placeholder="Currency" defaultValue={product?.currency ?? 'KES'} />
        <Input name="stock" type="number" placeholder="Stock" defaultValue={product?.stock ?? 0} required />
        <select name="fulfilment_type" defaultValue={product?.fulfilment_type ?? 'supplier_fulfilled'} className="h-10 rounded-md border px-3 text-sm">
          <option value="supplier_fulfilled">Supplier fulfilled</option>
          <option value="stocked">Stocked</option>
          <option value="quote_only">Quote only</option>
          <option value="preorder">Preorder</option>
          <option value="made_to_order">Made to order</option>
        </select>
        <Input name="supplier_sku" placeholder="Supplier SKU" defaultValue={product?.supplier_sku ?? ''} />
        <div className="grid grid-cols-2 gap-2">
          <Input name="weight_kg" type="number" step="0.01" placeholder="Weight kg" defaultValue={product?.weight_kg ?? ''} required />
          <Input name="length_cm" type="number" step="0.01" placeholder="Length cm" defaultValue={product?.length_cm ?? ''} required />
          <Input name="width_cm" type="number" step="0.01" placeholder="Width cm" defaultValue={product?.width_cm ?? ''} required />
          <Input name="height_cm" type="number" step="0.01" placeholder="Height cm" defaultValue={product?.height_cm ?? ''} required />
        </div>
        <Input name="images" placeholder="Image URLs, comma separated" defaultValue={(product?.images ?? []).join(', ')} />
        <textarea name="description" placeholder="Description" defaultValue={product?.description ?? ''} className="rounded-md border px-3 py-2 text-sm" rows={4} />
        <Input name="seo_title" placeholder="SEO title" defaultValue={product?.seo_title ?? ''} />
        <Input name="seo_description" placeholder="SEO description" defaultValue={product?.seo_description ?? ''} />
        <Input name="seo_keywords" placeholder="SEO keywords" defaultValue={product?.seo_keywords ?? ''} />
        <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? false} /> Published</label>
        <Button className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">{product ? 'Save product' : 'Create product'}</Button>
      </form>
    </Card>
  )
}

function DeliveryRuleForm({ rule, regions }: { rule?: SupplierDeliveryRule; regions: DeliveryRegion[] }) {
  return (
    <form action={asFormAction(saveSupplierDeliveryRule)} className="grid gap-3 rounded-lg border p-3">
      {rule && <input type="hidden" name="id" value={rule.id} />}
      <select name="region_id" defaultValue={rule?.region_id ?? ''} className="h-10 rounded-md border px-3 text-sm" required>
        <option value="">Select region</option>
        {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
      </select>
      <select name="fee_strategy" defaultValue={rule?.fee_strategy ?? 'flat'} className="h-10 rounded-md border px-3 text-sm">
        <option value="flat">Flat</option>
        <option value="cart_total">Cart total</option>
        <option value="weight">Weight</option>
        <option value="order_size">Order size</option>
      </select>
      <Input name="base_fee" type="number" step="0.01" placeholder="Base fee" defaultValue={rule?.base_fee ?? 0} />
      <Input name="free_over_amount" type="number" step="0.01" placeholder="Free over amount" defaultValue={rule?.free_over_amount ?? ''} />
      <Input name="per_kg_fee" type="number" step="0.01" placeholder="Per kg fee" defaultValue={rule?.per_kg_fee ?? ''} />
      <Input name="per_item_fee" type="number" step="0.01" placeholder="Per item fee" defaultValue={rule?.per_item_fee ?? ''} />
      <div className="grid grid-cols-2 gap-2">
        <Input name="lead_time_min_days" type="number" placeholder="Min days" defaultValue={rule?.lead_time_min_days ?? 1} />
        <Input name="lead_time_max_days" type="number" placeholder="Max days" defaultValue={rule?.lead_time_max_days ?? 3} />
      </div>
      <Button variant="outline" className="font-black">Save delivery rule</Button>
    </form>
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

function Limit({ label, value }: { label: string; value: string | number }) {
  return <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3"><span className="font-bold text-gray-500">{label}</span><span className="font-black text-[#061f3f]">{value}</span></div>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-10 rounded-md border px-3 text-sm ${props.className ?? ''}`} />
}
