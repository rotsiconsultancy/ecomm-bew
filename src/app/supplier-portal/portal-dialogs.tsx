'use client'

import { useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SUPPLIER_MEMBER_ROLES, SUPPLIER_NOTIFICATION_EVENTS } from '@/types/supplier'
import type { DeliveryRegion, SupplierDeliveryRule } from '@/types/supplier'
import { inviteSupplierStaff, saveSupplierDeliveryRule, saveSupplierNotificationEmail, saveSupplierProduct } from './actions'

export type SupplierProductValue = {
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

const fieldClass = 'h-11 w-full rounded-lg border border-[#d8e0ea] bg-white px-3 text-sm text-[#182333] outline-none focus:border-[#ff5f14] focus:ring-4 focus:ring-[#ff5f14]/10'
const labelClass = 'grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[#526173]'
type FormAction = (formData: FormData) => void | Promise<void>
const asFormAction = (action: unknown) => action as FormAction

export function ProductEditorDialog({ product }: { product?: SupplierProductValue }) {
  const [step, setStep] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const steps = ['Product', 'Selling', 'Delivery', 'Publish']
  const continueToNextStep = () => {
    const currentFields = formRef.current?.querySelectorAll<HTMLElement>(`[data-wizard-step="${step}"] input, [data-wizard-step="${step}"] select, [data-wizard-step="${step}"] textarea`)
    if (currentFields && !Array.from(currentFields).every((field) => field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement ? field.reportValidity() : true)) return
    setStep((value) => value + 1)
  }

  return (
    <Dialog onOpenChange={(open) => { if (!open) setStep(0) }}>
      <DialogTrigger asChild>
        <Button className={product ? 'h-9 bg-white font-black text-[#061f3f] shadow-none hover:bg-[#f4f7fa]' : 'h-11 bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]'} variant={product ? 'outline' : 'default'}>
          {product ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {product ? 'Edit' : 'Add product'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto bg-white p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-[#edf1f5] px-6 py-5 pr-12">
          <DialogTitle className="text-xl font-black text-[#061f3f]">{product ? 'Edit product' : 'Add a product'}</DialogTitle>
          <DialogDescription>Step {step + 1} of {steps.length}: {steps[step]}</DialogDescription>
          <div className="grid grid-cols-4 gap-2 pt-2" aria-label="Product setup progress">
            {steps.map((label, index) => (
              <div key={label} className="grid gap-1">
                <span className={`h-1.5 rounded-full ${index <= step ? 'bg-[#ff5f14]' : 'bg-[#e5eaf0]'}`} />
                <span className={`hidden text-[10px] font-black sm:block ${index === step ? 'text-[#061f3f]' : 'text-[#8a97a8]'}`}>{label}</span>
              </div>
            ))}
          </div>
        </DialogHeader>

        <form ref={formRef} action={asFormAction(saveSupplierProduct)} className="grid gap-5 px-6 pb-6">
          {product && <input type="hidden" name="id" value={product.id} />}
          <div data-wizard-step="0" className={step === 0 ? 'grid gap-4 pt-1 sm:grid-cols-2' : 'hidden'}>
            <Field label="Product name"><input className={fieldClass} name="name" defaultValue={product?.name ?? ''} required /></Field>
            <Field label="Supplier SKU"><input className={fieldClass} name="supplier_sku" defaultValue={product?.supplier_sku ?? ''} placeholder="Optional" /></Field>
            <Field label="Brand"><input className={fieldClass} name="brand" defaultValue={product?.brand ?? ''} required /></Field>
            <Field label="Category"><input className={fieldClass} name="category" defaultValue={product?.category ?? ''} required /></Field>
            <Field label="Description" className="sm:col-span-2"><textarea className={`${fieldClass} h-28 py-3`} name="description" defaultValue={product?.description ?? ''} /></Field>
            <input type="hidden" name="slug" value={product?.slug ?? ''} />
          </div>

          <div data-wizard-step="1" className={step === 1 ? 'grid gap-4 pt-1 sm:grid-cols-2' : 'hidden'}>
            <Field label="Pricing method"><select className={fieldClass} name="pricing_type" defaultValue={product?.pricing_type ?? 'fixed'}><option value="fixed">Fixed price</option><option value="quote">Quote only</option></select></Field>
            <Field label="Price (KES)"><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ''} /></Field>
            <Field label="Available stock"><input className={fieldClass} name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} required /></Field>
            <Field label="Fulfilment"><select className={fieldClass} name="fulfilment_type" defaultValue={product?.fulfilment_type ?? 'supplier_fulfilled'}><option value="supplier_fulfilled">Supplier fulfilled</option><option value="stocked">Stocked by Bewama</option><option value="quote_only">Quote only</option><option value="preorder">Preorder</option><option value="made_to_order">Made to order</option></select></Field>
            <input type="hidden" name="currency" value={product?.currency ?? 'KES'} />
          </div>

          <div data-wizard-step="2" className={step === 2 ? 'grid gap-4 pt-1 sm:grid-cols-2' : 'hidden'}>
            <Field label="Weight (kg)"><input className={fieldClass} name="weight_kg" type="number" min="0" step="0.01" defaultValue={product?.weight_kg ?? ''} required /></Field>
            <Field label="Length (cm)"><input className={fieldClass} name="length_cm" type="number" min="0" step="0.01" defaultValue={product?.length_cm ?? ''} required /></Field>
            <Field label="Width (cm)"><input className={fieldClass} name="width_cm" type="number" min="0" step="0.01" defaultValue={product?.width_cm ?? ''} required /></Field>
            <Field label="Height (cm)"><input className={fieldClass} name="height_cm" type="number" min="0" step="0.01" defaultValue={product?.height_cm ?? ''} required /></Field>
          </div>

          <div data-wizard-step="3" className={step === 3 ? 'grid gap-4 pt-1' : 'hidden'}>
            <Field label="Image URLs"><input className={fieldClass} name="images" defaultValue={(product?.images ?? []).join(', ')} placeholder="Separate multiple URLs with commas" /></Field>
            <div className="rounded-xl border border-[#d8e0ea] bg-[#f7f9fb] p-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm font-bold text-[#061f3f]">
                <input className="mt-1 h-4 w-4 accent-[#ff5f14]" name="is_active" type="checkbox" defaultChecked={product?.is_active ?? false} />
                <span>Publish this product immediately<span className="mt-1 block text-xs font-semibold leading-5 text-[#728196]">Leave this off to save a private draft you can finish later.</span></span>
              </label>
            </div>
            <input type="hidden" name="seo_title" value={product?.seo_title ?? ''} />
            <input type="hidden" name="seo_description" value={product?.seo_description ?? ''} />
            <input type="hidden" name="seo_keywords" value={product?.seo_keywords ?? ''} />
          </div>

          <DialogFooter className="border-t border-[#edf1f5] pt-5">
            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
            {step > 0 && <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}><ChevronLeft /> Back</Button>}
            {step < steps.length - 1 ? (
              <Button type="button" className="bg-[#061f3f] text-white hover:bg-[#0a315f]" onClick={continueToNextStep}>Continue <ChevronRight /></Button>
            ) : (
              <Button type="submit" className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">{product ? 'Save changes' : 'Create product'}</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function StaffInviteDialog() {
  return (
    <SimpleDialog trigger={<><UserPlus /> Invite staff</>} title="Invite a team member" description="Give a colleague access to this supplier account.">
      <form action={asFormAction(inviteSupplierStaff)} className="grid gap-4">
        <Field label="Work email"><input className={fieldClass} name="email" type="email" placeholder="name@company.com" required /></Field>
        <Field label="Portal role"><select className={fieldClass} name="member_role">{SUPPLIER_MEMBER_ROLES.filter((role) => role.value !== 'owner').map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></Field>
        <ModalActions submit="Send invitation" />
      </form>
    </SimpleDialog>
  )
}

export function DeliveryRuleDialog({ regions, rule }: { regions: DeliveryRegion[]; rule?: SupplierDeliveryRule }) {
  return (
    <SimpleDialog trigger={rule ? <><Pencil /> Edit</> : <><Plus /> Add region</>} title={rule ? 'Edit delivery region' : 'Add delivery region'} description="Set the delivery price and expected lead time for this area." subtleTrigger={Boolean(rule)}>
      <form action={asFormAction(saveSupplierDeliveryRule)} className="grid gap-4 sm:grid-cols-2">
        {rule && <input type="hidden" name="id" value={rule.id} />}
        <Field label="Region"><select className={fieldClass} name="region_id" defaultValue={rule?.region_id ?? ''} required><option value="">Select a region</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></Field>
        <Field label="Fee method"><select className={fieldClass} name="fee_strategy" defaultValue={rule?.fee_strategy ?? 'flat'}><option value="flat">Flat fee</option><option value="cart_total">Based on cart total</option><option value="weight">Based on weight</option><option value="order_size">Based on item count</option></select></Field>
        <Field label="Base fee (KES)"><input className={fieldClass} name="base_fee" type="number" min="0" step="0.01" defaultValue={rule?.base_fee ?? 0} /></Field>
        <Field label="Free delivery over"><input className={fieldClass} name="free_over_amount" type="number" min="0" defaultValue={rule?.free_over_amount ?? ''} /></Field>
        <Field label="Per kg fee"><input className={fieldClass} name="per_kg_fee" type="number" min="0" defaultValue={rule?.per_kg_fee ?? ''} /></Field>
        <Field label="Per item fee"><input className={fieldClass} name="per_item_fee" type="number" min="0" defaultValue={rule?.per_item_fee ?? ''} /></Field>
        <Field label="Minimum days"><input className={fieldClass} name="lead_time_min_days" type="number" min="0" defaultValue={rule?.lead_time_min_days ?? 1} /></Field>
        <Field label="Maximum days"><input className={fieldClass} name="lead_time_max_days" type="number" min="0" defaultValue={rule?.lead_time_max_days ?? 3} /></Field>
        <div className="sm:col-span-2"><ModalActions submit="Save delivery rule" /></div>
      </form>
    </SimpleDialog>
  )
}

export function NotificationDialog({ recipient }: { recipient?: { id: string; label: string; email: string; events: string[] | null } }) {
  return (
    <SimpleDialog trigger={recipient ? <><Pencil /> Edit</> : <><Plus /> Add recipient</>} title={recipient ? 'Edit notification recipient' : 'Add notification recipient'} description="Choose who should receive operational supplier emails." subtleTrigger={Boolean(recipient)}>
      <form action={asFormAction(saveSupplierNotificationEmail)} className="grid gap-4">
        {recipient && <input type="hidden" name="id" value={recipient.id} />}
        <Field label="Recipient label"><input className={fieldClass} name="label" defaultValue={recipient?.label ?? ''} placeholder="Operations team" required /></Field>
        <Field label="Email address"><input className={fieldClass} name="email" type="email" defaultValue={recipient?.email ?? ''} placeholder="orders@company.com" required /></Field>
        <fieldset className="grid gap-2"><legend className={labelClass}>Notifications</legend>{SUPPLIER_NOTIFICATION_EVENTS.map((event) => <label key={event.value} className="flex items-center gap-2 rounded-lg border p-3 text-sm font-bold text-[#39495b]"><input type="checkbox" name="events" value={event.value} defaultChecked={recipient?.events?.includes(event.value) ?? false} className="accent-[#ff5f14]" />{event.label}</label>)}</fieldset>
        <ModalActions submit={recipient ? 'Save changes' : 'Add recipient'} />
      </form>
    </SimpleDialog>
  )
}

function SimpleDialog({ trigger, title, description, children, subtleTrigger = false }: { trigger: ReactNode; title: string; description: string; children: ReactNode; subtleTrigger?: boolean }) {
  return <Dialog><DialogTrigger asChild><Button variant={subtleTrigger ? 'outline' : 'default'} className={subtleTrigger ? 'font-black' : 'h-11 bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]'}>{trigger}</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto bg-white sm:max-w-xl"><DialogHeader><DialogTitle className="text-xl font-black text-[#061f3f]">{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>
}

function ModalActions({ submit }: { submit: string }) {
  return <DialogFooter className="mt-2"><DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose><Button className="bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]" type="submit">{submit}</Button></DialogFooter>
}

function Field({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return <label className={`${labelClass} ${className}`}>{label}{children}</label>
}
