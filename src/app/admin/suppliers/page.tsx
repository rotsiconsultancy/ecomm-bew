import Link from 'next/link'
import { AlertTriangle, Handshake, Package, Settings, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'
import {
  approveSupplierApplication,
  createSupplierAction,
  createSupplierWarning,
  pauseSupplierProduct,
  rejectSupplierApplication,
  saveDeliveryRegion,
  updateSupplierPackage,
  updateSupplierPackageConfig,
  updateSupplierStatus,
} from './actions'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ tab?: string }> }

const TABS = [
  ['requests', 'Requests'],
  ['suppliers', 'Suppliers'],
  ['packages', 'Packages'],
  ['performance', 'Performance'],
  ['regions', 'Regions'],
  ['settings', 'Settings'],
]

type FormAction = (formData: FormData) => void | Promise<void>

function asFormAction(action: unknown): FormAction {
  return action as FormAction
}

function relatedSupplierName(value: unknown) {
  if (Array.isArray(value)) return value[0]?.company_name ?? null
  if (value && typeof value === 'object' && 'company_name' in value) {
    const companyName = (value as { company_name?: unknown }).company_name
    return typeof companyName === 'string' ? companyName : null
  }
  return null
}

export default async function AdminSuppliersPage({ searchParams }: Props) {
  await getAdminContext()
  const params = await searchParams
  const tab = params.tab ?? 'requests'
  const supabase = await createServiceClient()

  const [
    { data: applications },
    { data: suppliers },
    { data: packages },
    { data: regions },
    { data: fulfilments },
    { data: warnings },
    { data: products },
  ] = await Promise.all([
    supabase.from('supplier_applications').select('*').order('created_at', { ascending: false }),
    supabase.from('suppliers').select('*, supplier_members(*), supplier_packages(*)').order('created_at', { ascending: false }),
    supabase.from('supplier_packages').select('*').order('key', { ascending: true }),
    supabase.from('delivery_regions').select('*').order('sort_order', { ascending: true }),
    supabase.from('supplier_fulfilments').select('*, suppliers(company_name)').order('created_at', { ascending: false }),
    supabase.from('supplier_performance_events').select('*, suppliers(company_name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('products').select('id, name, supplier_id, product_status, is_active, suppliers(company_name, primary_email)').not('supplier_id', 'is', null).order('created_at', { ascending: false }).limit(50),
  ])

  const supplierRows = suppliers ?? []
  const applicationRows = applications ?? []
  const packageRows = packages ?? []
  const regionRows = regions ?? []
  const fulfilmentRows = fulfilments ?? []
  const warningRows = warnings ?? []
  const productRows = products ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#061f3f]">Suppliers</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Applications, companies, packages, delivery regions, and supplier performance.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/suppliers?tab=${key}`}
            className={`rounded-lg px-4 py-2 text-sm font-black transition-colors ${
              tab === key ? 'bg-[#061f3f] text-white' : 'bg-white text-[#061f3f] hover:bg-gray-50'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {tab === 'requests' && (
        <div className="grid gap-4">
          {applicationRows.length === 0 ? <Empty label="No supplier requests yet." /> : applicationRows.map((app) => (
            <Card key={app.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-[#061f3f]">{app.company_name}</h2>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-500">{app.contact_name} · {app.email} · {app.phone}</p>
                  <p className="mt-2 text-sm text-gray-600">{app.business_description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                    <span>KRA: {app.kra_pin}</span>
                    <span>Reg: {app.registration_number}</span>
                    <span>Location: {app.location}</span>
                    <span>Categories: {(app.product_categories ?? []).join(', ') || '—'}</span>
                  </div>
                  {app.admin_notes && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{app.admin_notes}</p>}
                </div>
                {app.status === 'pending' && (
                  <div className="grid min-w-72 gap-2">
                    <form action={asFormAction(approveSupplierApplication.bind(null, app.id))}>
                      <Button className="w-full bg-green-600 font-black text-white hover:bg-green-700">Approve</Button>
                    </form>
                    <form action={asFormAction(rejectSupplierApplication.bind(null, app.id))} className="space-y-2">
                      <textarea name="admin_notes" placeholder="Rejection reason" className="w-full rounded-lg border px-3 py-2 text-sm" />
                      <Button variant="outline" className="w-full border-red-200 font-black text-red-600 hover:bg-red-50">Reject</Button>
                    </form>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="p-5">
            <h2 className="text-lg font-black text-[#061f3f]">Create supplier manually</h2>
            <form action={asFormAction(createSupplierAction)} className="mt-4 grid gap-3">
              <Input name="company_name" placeholder="Company name" required />
              <Input name="primary_contact_name" placeholder="Primary contact name" required />
              <Input name="owner_email" type="email" placeholder="Owner email" required />
              <Input name="phone" placeholder="Phone" />
              <Input name="kra_pin" placeholder="KRA PIN" />
              <Input name="registration_number" placeholder="Registration number" />
              <Input name="location" placeholder="Location" />
              <Input name="website_url" placeholder="Website URL" />
              <Input name="product_categories" placeholder="Categories, comma separated" />
              <select name="package_key" className="h-10 rounded-md border px-3 text-sm">
                {packageRows.map((pkg) => <option key={pkg.key} value={pkg.key}>{pkg.name}</option>)}
              </select>
              <textarea name="business_description" placeholder="Business description" className="rounded-md border px-3 py-2 text-sm" />
              <Button className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">Create and invite</Button>
            </form>
          </Card>

          <div className="grid gap-4">
            {supplierRows.map((supplier) => (
              <Card key={supplier.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-[#061f3f]">{supplier.company_name}</h2>
                      <StatusBadge status={supplier.status} />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-500">{supplier.primary_contact_name} · {supplier.primary_email}</p>
                    <p className="mt-2 text-xs font-bold text-gray-400">Package: {supplier.package_key}</p>
                    <p className="mt-1 text-xs font-bold text-gray-400">Members: {(supplier.supplier_members ?? []).length}</p>
                    {supplier.suspension_reason && <p className="mt-2 text-xs font-bold text-red-600">{supplier.suspension_reason}</p>}
                  </div>
                  <div className="grid min-w-64 gap-2">
                    <form action={async (formData) => {
                      'use server'
                      await updateSupplierPackage(supplier.id, String(formData.get('package_key') ?? 'starter'))
                    }} className="flex gap-2">
                      <select name="package_key" defaultValue={supplier.package_key} className="h-10 flex-1 rounded-md border px-3 text-sm">
                        {packageRows.map((pkg) => <option key={pkg.key} value={pkg.key}>{pkg.name}</option>)}
                      </select>
                      <Button variant="outline">Save</Button>
                    </form>
                    {supplier.status === 'suspended' ? (
                      <form action={asFormAction(updateSupplierStatus.bind(null, supplier.id, 'active'))}>
                        <Button className="w-full bg-green-600 font-black text-white hover:bg-green-700">Reactivate</Button>
                      </form>
                    ) : (
                      <form action={asFormAction(updateSupplierStatus.bind(null, supplier.id, 'suspended'))} className="space-y-2">
                        <Input name="reason" placeholder="Suspension reason" />
                        <Button variant="outline" className="w-full border-red-200 font-black text-red-600 hover:bg-red-50">Suspend</Button>
                      </form>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'packages' && (
        <div className="grid gap-4 lg:grid-cols-3">
          {packageRows.map((pkg) => (
            <Card key={pkg.key} className="p-5">
              <h2 className="text-xl font-black text-[#061f3f]">{pkg.name}</h2>
              <form action={asFormAction(updateSupplierPackageConfig.bind(null, pkg.key))} className="mt-4 grid gap-3">
                <Input name="name" defaultValue={pkg.name} />
                <textarea name="description" defaultValue={pkg.description ?? ''} className="rounded-md border px-3 py-2 text-sm" />
                <Input name="max_staff" type="number" defaultValue={pkg.max_staff} />
                <Input name="max_active_products" type="number" defaultValue={pkg.max_active_products} />
                <Input name="max_product_images" type="number" defaultValue={pkg.max_product_images} />
                <Input name="analytics_level" defaultValue={pkg.analytics_level} />
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><input name="is_active" type="checkbox" defaultChecked={pkg.is_active} /> Active</label>
                <Button variant="outline" className="font-black">Save package</Button>
              </form>
            </Card>
          ))}
        </div>
      )}

      {tab === 'performance' && (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat icon={Handshake} label="Suppliers" value={supplierRows.length} />
            <Stat icon={Truck} label="Fulfilments" value={fulfilmentRows.length} />
            <Stat icon={AlertTriangle} label="Rejected" value={fulfilmentRows.filter((f) => f.status === 'rejected').length} />
          </div>
          {supplierRows.map((supplier) => {
            const own = fulfilmentRows.filter((f) => f.supplier_id === supplier.id)
            const rejected = own.filter((f) => f.status === 'rejected').length
            return (
              <Card key={supplier.id} className="p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                  <div>
                    <h2 className="text-lg font-black text-[#061f3f]">{supplier.company_name}</h2>
                    <p className="text-sm font-semibold text-gray-500">{own.length} fulfilments · {rejected} rejected · {own.length ? Math.round((rejected / own.length) * 100) : 0}% rejection rate</p>
                  </div>
                  <form action={asFormAction(createSupplierWarning.bind(null, supplier.id))} className="grid gap-2">
                    <select name="severity" className="h-10 rounded-md border px-3 text-sm">
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                      <option value="info">Info</option>
                    </select>
                    <textarea name="notes" required placeholder="Warning note" className="rounded-md border px-3 py-2 text-sm" />
                    <Button variant="outline" className="font-black">Add warning</Button>
                  </form>
                </div>
              </Card>
            )
          })}
          {warningRows.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-black text-[#061f3f]">Recent performance events</h2>
              <div className="grid gap-2">
                {warningRows.map((event) => (
                  <div key={event.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span className="font-black text-[#061f3f]">{event.suppliers?.company_name ?? 'Supplier'}</span>
                    <span className="text-gray-500"> · {event.event_type} · {event.severity} · {event.notes}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'regions' && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="p-5">
            <h2 className="text-lg font-black text-[#061f3f]">Add region</h2>
            <form action={asFormAction(saveDeliveryRegion)} className="mt-4 grid gap-3">
              <Input name="name" placeholder="Region or city" required />
              <select name="region_type" className="h-10 rounded-md border px-3 text-sm">
                <option value="city">City</option>
                <option value="county">County</option>
                <option value="area">Area</option>
              </select>
              <Input name="sort_order" type="number" defaultValue={0} />
              <Button className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">Save region</Button>
            </form>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-black text-[#061f3f]">Fixed regions</h2>
            <div className="grid gap-2">
              {regionRows.map((region) => (
                <form key={region.id} action={asFormAction(saveDeliveryRegion)} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_140px_90px_120px]">
                  <input type="hidden" name="id" value={region.id} />
                  <Input name="name" defaultValue={region.name} />
                  <select name="region_type" defaultValue={region.region_type} className="h-10 rounded-md border px-3 text-sm">
                    <option value="city">City</option>
                    <option value="county">County</option>
                    <option value="area">Area</option>
                  </select>
                  <Input name="sort_order" type="number" defaultValue={region.sort_order} />
                  <Button variant="outline">Save</Button>
                </form>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <Settings className="mb-3 h-6 w-6 text-[#ff5f14]" />
            <h2 className="text-lg font-black text-[#061f3f]">Supplier defaults</h2>
            <p className="mt-2 text-sm font-semibold text-gray-500">Invite expiry is fixed at 7 days. Starter is the default package for public approvals.</p>
          </Card>
          <Card className="p-5">
            <Package className="mb-3 h-6 w-6 text-[#ff5f14]" />
            <h2 className="text-lg font-black text-[#061f3f]">Paused supplier products</h2>
            <div className="mt-4 grid gap-2">
              {productRows.map((product) => (
                <div key={product.id} className="rounded-lg border p-3">
                  <p className="font-black text-[#061f3f]">{product.name}</p>
                  <p className="text-xs font-semibold text-gray-500">{relatedSupplierName(product.suppliers) ?? 'Supplier'} · {product.product_status}</p>
                  {product.product_status !== 'paused_by_admin' && (
                    <form action={asFormAction(pauseSupplierProduct.bind(null, product.id))} className="mt-2 flex gap-2">
                      <Input name="reason" placeholder="Pause reason" />
                      <Button variant="outline" className="border-red-200 text-red-600">Pause</Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'active' || status === 'approved'
    ? 'bg-green-100 text-green-700'
    : status === 'pending' || status === 'invited'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-600'
  return <Badge className={`border-none capitalize ${cls}`}>{status}</Badge>
}

function Empty({ label }: { label: string }) {
  return <Card className="p-10 text-center text-sm font-semibold text-gray-400">{label}</Card>
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-10 rounded-md border px-3 text-sm ${props.className ?? ''}`} />
}
