'use client'

import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  BellRing,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileText,
  Loader2,
  PackageCheck,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  UserPlus,
} from 'lucide-react'
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
import {
  deleteSupplierNotificationEmail,
  inviteSupplierStaff,
  saveSupplierDeliveryRule,
  saveSupplierNotificationEmail,
  saveSupplierProduct,
} from './actions'

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
const labelClass = 'grid gap-1.5 text-sm font-bold text-[#334155]'
type ActionResult = { success: boolean; error?: string }
type ServerAction = (formData: FormData) => Promise<ActionResult>

function useServerAction(action: ServerAction) {
  const [state, setState] = useState<ActionResult | null>(null)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return

    setPending(true)
    setState(null)
    try {
      setState(await action(new FormData(event.currentTarget)))
    } catch {
      setState({ success: false, error: 'Something went wrong. Please try again.' })
    } finally {
      setPending(false)
    }
  }

  return { state, submit, pending }
}

function descriptionText(value: string | null | undefined) {
  if (!value) return ''
  try {
    const document = JSON.parse(value) as { content?: Array<{ content?: Array<{ text?: string }> }> }
    return document.content?.flatMap((node) => node.content?.map((child) => child.text ?? '') ?? []).join('\n') ?? ''
  } catch {
    return value
  }
}

export function ProductEditorDialog({ product }: { product?: SupplierProductValue }) {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  const [successDismissed, setSuccessDismissed] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const steps = ['Product', 'Selling', 'Delivery', 'Publish']
  const { state, submit, pending } = useServerAction(saveSupplierProduct)

  useEffect(() => {
    if (!state?.success) return
    setSuccessDismissed(false)
    const timeout = window.setTimeout(() => {
      setOpen(false)
      setStep(0)
    }, 650)
    return () => window.clearTimeout(timeout)
  }, [state])

  const continueToNextStep = () => {
    const currentFields = formRef.current?.querySelectorAll<HTMLElement>(`[data-wizard-step="${step}"] input, [data-wizard-step="${step}"] select, [data-wizard-step="${step}"] textarea`)
    if (currentFields && !Array.from(currentFields).every((field) => field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement ? field.reportValidity() : true)) return
    setStep((value) => value + 1)
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (nextOpen && state?.success) setSuccessDismissed(true)
      setOpen(nextOpen)
      if (!nextOpen) setStep(0)
    }}>
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

        <form ref={formRef} onSubmit={submit} className="grid gap-5 px-6 pb-6">
          {product && <input type="hidden" name="id" value={product.id} />}
          <fieldset disabled={pending} className="contents">
          <div data-wizard-step="0" className={step === 0 ? 'grid gap-4 pt-1 sm:grid-cols-2' : 'hidden'}>
            <Field label="Product name" hint="Use the name buyers will recognise in the catalog."><input className={fieldClass} name="name" defaultValue={product?.name ?? ''} placeholder="e.g. Soma Bond SB340" required /></Field>
            <Field label="Your product code (SKU)" hint="Optional internal code used by your team."><input className={fieldClass} name="supplier_sku" defaultValue={product?.supplier_sku ?? ''} placeholder="e.g. SB340-600ML" /></Field>
            <Field label="Brand or manufacturer"><input className={fieldClass} name="brand" defaultValue={product?.brand ?? ''} placeholder="e.g. Soma Fix" required /></Field>
            <Field label="Catalog category"><input className={fieldClass} name="category" defaultValue={product?.category ?? ''} placeholder="e.g. Adhesives" required /></Field>
            <Field label="Buyer-facing description" hint="Explain what the product is for, its key benefit, and where it can be used." className="sm:col-span-2"><textarea className={`${fieldClass} h-32 py-3`} name="description" defaultValue={descriptionText(product?.description)} placeholder="Describe the product, applications, and important specifications…" /></Field>
            <input type="hidden" name="slug" value={product?.slug ?? ''} />
          </div>

          <div data-wizard-step="1" className={step === 1 ? 'grid gap-4 pt-1 sm:grid-cols-2' : 'hidden'}>
            <Field label="How buyers purchase" hint="Fixed price enables cart checkout; quote only hides the price."><select className={fieldClass} name="pricing_type" defaultValue={product?.pricing_type ?? 'fixed'}><option value="fixed">Buy at a fixed price</option><option value="quote">Request a quote</option></select></Field>
            <Field label="Selling price (KES)" hint="Enter 0 only when the product is quote-only."><input className={fieldClass} name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ''} placeholder="0.00" /></Field>
            <Field label="Units currently available" hint="This controls the stock status buyers see."><input className={fieldClass} name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} required /></Field>
            <Field label="How the order is fulfilled"><select className={fieldClass} name="fulfilment_type" defaultValue={product?.fulfilment_type ?? 'supplier_fulfilled'}><option value="supplier_fulfilled">We deliver to the buyer</option><option value="stocked">Bewama holds this stock</option><option value="quote_only">Fulfil after quote approval</option><option value="preorder">Available for pre-order</option><option value="made_to_order">Made after ordering</option></select></Field>
            <input type="hidden" name="currency" value={product?.currency ?? 'KES'} />
          </div>

          <div data-wizard-step="2" className={step === 2 ? 'grid gap-4 pt-1 sm:grid-cols-2' : 'hidden'}>
            <div className="sm:col-span-2 rounded-lg bg-[#f7f9fb] p-3 text-sm font-semibold leading-6 text-[#526173]">Enter the packed product’s measurements. Bewama uses them to calculate delivery correctly.</div>
            <Field label="Packed weight (kg)"><input className={fieldClass} name="weight_kg" type="number" min="0" step="0.01" defaultValue={product?.weight_kg ?? ''} placeholder="e.g. 2.5" required /></Field>
            <Field label="Package length (cm)"><input className={fieldClass} name="length_cm" type="number" min="0" step="0.01" defaultValue={product?.length_cm ?? ''} placeholder="e.g. 30" required /></Field>
            <Field label="Package width (cm)"><input className={fieldClass} name="width_cm" type="number" min="0" step="0.01" defaultValue={product?.width_cm ?? ''} placeholder="e.g. 20" required /></Field>
            <Field label="Package height (cm)"><input className={fieldClass} name="height_cm" type="number" min="0" step="0.01" defaultValue={product?.height_cm ?? ''} placeholder="e.g. 12" required /></Field>
          </div>

          <div data-wizard-step="3" className={step === 3 ? 'grid gap-4 pt-1' : 'hidden'}>
            <Field label="Product image links" hint="Paste full image URLs separated by commas. The first image becomes the catalog thumbnail."><input className={fieldClass} name="images" defaultValue={(product?.images ?? []).join(', ')} placeholder="https://…/front.jpg, https://…/side.jpg" /></Field>
            {(product?.images?.[0]) && (
              <div className="flex items-center gap-3 rounded-xl border border-[#d8e0ea] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div><p className="text-sm font-black text-[#061f3f]">Current catalog thumbnail</p><p className="mt-1 text-xs font-semibold text-[#728196]">Replace the first link above to change it.</p></div>
              </div>
            )}
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
          </fieldset>

          <DialogFooter className="border-t border-[#edf1f5] pt-5">
            {state?.error && <p role="alert" className="mr-auto flex items-center gap-2 text-sm font-bold text-red-700"><AlertCircle className="h-4 w-4" />{state.error}</p>}
            <DialogClose asChild><Button type="button" variant="ghost" disabled={pending}>Cancel</Button></DialogClose>
            {step > 0 && <Button type="button" variant="outline" disabled={pending} onClick={() => setStep((value) => value - 1)}><ChevronLeft /> Back</Button>}
            {step < steps.length - 1 ? (
              <Button type="button" className="bg-[#061f3f] text-white hover:bg-[#0a315f]" onClick={continueToNextStep}>Continue <ChevronRight /></Button>
            ) : (
              <Button type="submit" disabled={pending || (Boolean(state?.success) && !successDismissed)} aria-busy={pending} className="min-w-36 bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : state?.success && !successDismissed ? <Check className="h-4 w-4" /> : null}
                {pending ? 'Saving product…' : state?.success && !successDismissed ? 'Product saved' : product ? 'Update product' : 'Create product'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function StaffInviteDialog() {
  return (
    <SimpleDialog
      trigger={<><UserPlus /> Invite staff</>}
      title="Invite a team member"
      description="Give a colleague access to this supplier account."
      action={inviteSupplierStaff}
      submit="Send invitation"
      pendingSubmit="Sending invitation…"
    >
      <Field label="Team member’s work email" hint="We’ll send a secure invitation link to this address."><input className={fieldClass} name="email" type="email" placeholder="name@company.com" required /></Field>
      <Field label="What they can manage"><select className={fieldClass} name="member_role">{SUPPLIER_MEMBER_ROLES.filter((role) => role.value !== 'owner').map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></Field>
    </SimpleDialog>
  )
}

export function DeliveryRuleDialog({ regions, rule }: { regions: DeliveryRegion[]; rule?: SupplierDeliveryRule }) {
  return (
    <SimpleDialog
      trigger={rule ? <><Pencil /> Edit</> : <><Plus /> Add region</>}
      title={rule ? 'Edit delivery region' : 'Add delivery region'}
      description="Set the delivery price and expected lead time buyers will see."
      subtleTrigger={Boolean(rule)}
      action={saveSupplierDeliveryRule}
      submit="Save delivery rule"
      pendingSubmit="Saving delivery rule…"
      formClassName="grid gap-4 sm:grid-cols-2"
    >
      {rule && <input type="hidden" name="id" value={rule.id} />}
      <Field label="Where you deliver"><select className={fieldClass} name="region_id" defaultValue={rule?.region_id ?? ''} required><option value="">Select a region</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></Field>
      <Field label="How the fee is calculated"><select className={fieldClass} name="fee_strategy" defaultValue={rule?.fee_strategy ?? 'flat'}><option value="flat">One flat delivery fee</option><option value="cart_total">Based on the order value</option><option value="weight">Based on total weight</option><option value="order_size">Based on item count</option></select></Field>
      <Field label="Starting delivery fee (KES)"><input className={fieldClass} name="base_fee" type="number" min="0" step="0.01" defaultValue={rule?.base_fee ?? 0} /></Field>
      <Field label="Free delivery order value (KES)" hint="Optional. Leave blank when free delivery does not apply."><input className={fieldClass} name="free_over_amount" type="number" min="0" defaultValue={rule?.free_over_amount ?? ''} /></Field>
      <Field label="Additional fee per kg (KES)"><input className={fieldClass} name="per_kg_fee" type="number" min="0" defaultValue={rule?.per_kg_fee ?? ''} /></Field>
      <Field label="Additional fee per item (KES)"><input className={fieldClass} name="per_item_fee" type="number" min="0" defaultValue={rule?.per_item_fee ?? ''} /></Field>
      <Field label="Earliest delivery (days)"><input className={fieldClass} name="lead_time_min_days" type="number" min="0" defaultValue={rule?.lead_time_min_days ?? 1} /></Field>
      <Field label="Latest delivery (days)"><input className={fieldClass} name="lead_time_max_days" type="number" min="0" defaultValue={rule?.lead_time_max_days ?? 3} /></Field>
      <label className="flex items-start gap-3 rounded-xl border border-[#d8e0ea] bg-[#f7f9fb] p-4 text-sm font-bold text-[#061f3f] sm:col-span-2">
        <input className="mt-1 h-4 w-4 accent-[#ff5f14]" type="checkbox" name="is_active" defaultChecked={rule?.is_active ?? true} />
        <span>Offer delivery to this region<span className="mt-1 block text-xs font-semibold leading-5 text-[#728196]">Turn this off to keep the rule without showing it to buyers.</span></span>
      </label>
    </SimpleDialog>
  )
}

const eventPresentation = {
  new_supplier_fulfilment: { icon: PackageCheck, description: 'A buyer places an order that your team needs to fulfil.' },
  supplier_rejected_fulfilment: { icon: CircleAlert, description: 'An order fulfilment is rejected and needs attention.' },
  supplier_product_paused: { icon: FileText, description: 'Bewama pauses one of your catalog products.' },
  supplier_warning: { icon: ShieldAlert, description: 'Bewama sends an account or performance warning.' },
  supplier_suspended: { icon: AlertCircle, description: 'Your supplier account is suspended.' },
  supplier_reactivated: { icon: CheckCircle2, description: 'Your supplier account becomes active again.' },
} as const

export function NotificationDialog({ recipient }: { recipient?: { id: string; label: string; email: string; events: string[] | null; is_active?: boolean } }) {
  return (
    <SimpleDialog
      trigger={recipient ? <><Pencil /> Edit</> : <><Plus /> Add recipient</>}
      title={recipient ? 'Edit notification recipient' : 'Add notification recipient'}
      description="Route each operational alert to the person or team responsible for it."
      subtleTrigger={Boolean(recipient)}
      action={saveSupplierNotificationEmail}
      submit={recipient ? 'Update recipient' : 'Add recipient'}
      pendingSubmit={recipient ? 'Updating recipient…' : 'Adding recipient…'}
      deleteRecipient={recipient ? { id: recipient.id, label: recipient.label } : undefined}
    >
      {recipient && <input type="hidden" name="id" value={recipient.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Who is this inbox for?" hint="Use a recognisable team or role name."><input className={fieldClass} name="label" defaultValue={recipient?.label ?? ''} placeholder="e.g. Dispatch team" required /></Field>
        <Field label="Where should alerts be sent?"><input className={fieldClass} name="email" type="email" defaultValue={recipient?.email ?? ''} placeholder="orders@company.com" required /></Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-black text-[#061f3f]">Choose the alerts this inbox receives</legend>
        <p className="mb-2 text-xs font-semibold leading-5 text-[#728196]">Each selected alert is emailed as soon as the event happens.</p>
        {SUPPLIER_NOTIFICATION_EVENTS.map((event) => {
          const presentation = eventPresentation[event.value as keyof typeof eventPresentation]
          const Icon = presentation?.icon ?? BellRing
          return (
            <label key={event.value} className="group flex cursor-pointer items-start gap-3 rounded-xl border border-[#d8e0ea] p-3.5 transition-colors hover:bg-[#f7f9fb] has-[:checked]:border-[#ff5f14] has-[:checked]:bg-[#fff5ef]">
              <input type="checkbox" name="events" value={event.value} defaultChecked={recipient?.events?.includes(event.value) ?? false} className="mt-1 h-4 w-4 accent-[#ff5f14]" />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eef2f6] text-[#526173] group-has-[:checked]:bg-[#ff5f14] group-has-[:checked]:text-white"><Icon className="h-4 w-4" /></span>
              <span><span className="block text-sm font-black text-[#061f3f]">{event.label}</span><span className="mt-0.5 block text-xs font-semibold leading-5 text-[#728196]">{presentation?.description}</span></span>
            </label>
          )
        })}
      </fieldset>
      <label className="flex items-start gap-3 rounded-xl border border-[#d8e0ea] bg-[#f7f9fb] p-4 text-sm font-bold text-[#061f3f]">
        <input className="mt-1 h-4 w-4 accent-[#ff5f14]" type="checkbox" name="is_active" defaultChecked={recipient?.is_active ?? true} />
        <span>Send alerts to this inbox<span className="mt-1 block text-xs font-semibold leading-5 text-[#728196]">Turn this off to pause delivery without deleting the recipient.</span></span>
      </label>
    </SimpleDialog>
  )
}

function SimpleDialog({
  trigger,
  title,
  description,
  children,
  action,
  submit,
  pendingSubmit,
  subtleTrigger = false,
  formClassName = 'grid gap-4',
  deleteRecipient,
}: {
  trigger: ReactNode
  title: string
  description: string
  children: ReactNode
  action: ServerAction
  submit: string
  pendingSubmit: string
  subtleTrigger?: boolean
  formClassName?: string
  deleteRecipient?: { id: string; label: string }
}) {
  const [open, setOpen] = useState(false)
  const [successDismissed, setSuccessDismissed] = useState(false)
  const { state, submit: handleSubmit, pending } = useServerAction(action)

  useEffect(() => {
    if (!state?.success) return
    setSuccessDismissed(false)
    const timeout = window.setTimeout(() => setOpen(false), 650)
    return () => window.clearTimeout(timeout)
  }, [state])

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (nextOpen && state?.success) setSuccessDismissed(true)
      setOpen(nextOpen)
    }}>
      <DialogTrigger asChild>
        <Button variant={subtleTrigger ? 'outline' : 'default'} className={subtleTrigger ? 'font-black' : 'h-11 bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]'}>{trigger}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white sm:max-w-xl">
        <DialogHeader><DialogTitle className="text-xl font-black text-[#061f3f]">{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className={formClassName}>
          <fieldset disabled={pending} className="contents">{children}</fieldset>
          {state?.error && <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{state.error}</p>}
          <ModalActions
            submit={submit}
            pendingSubmit={pendingSubmit}
            pending={pending}
            saved={Boolean(state?.success) && !successDismissed}
            onDelete={deleteRecipient ? () => deleteSupplierNotificationEmail(deleteRecipient.id) : undefined}
            deleteLabel={deleteRecipient?.label}
            onDeleted={() => setOpen(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ModalActions({
  submit,
  pendingSubmit,
  pending,
  saved,
  onDelete,
  deleteLabel,
  onDeleted,
}: {
  submit: string
  pendingSubmit: string
  pending: boolean
  saved: boolean
  onDelete?: () => Promise<ActionResult>
  deleteLabel?: string
  onDeleted?: () => void
}) {
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleDelete = () => {
    if (!onDelete) return
    setDeleteError(null)
    startDelete(async () => {
      const result = await onDelete()
      if (!result.success) {
        setDeleteError(result.error ?? 'The notification recipient could not be deleted.')
        return
      }
      onDeleted?.()
    })
  }

  return (
    <>
      {deleteError && <p role="alert" className="text-sm font-bold text-red-700">{deleteError}</p>}
      {confirmingDelete && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 sm:col-span-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
            <div>
              <p className="font-black text-red-900">Delete {deleteLabel ?? 'this recipient'}?</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-red-700">This inbox will stop receiving all supplier alerts. This action cannot be undone.</p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={deleting} onClick={() => setConfirmingDelete(false)}>Keep recipient</Button>
            <Button type="button" disabled={deleting} onClick={handleDelete} className="bg-red-700 font-black text-white hover:bg-red-800">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </Button>
          </div>
        </div>
      )}
      <DialogFooter className="mt-2 gap-2 sm:col-span-2">
        {onDelete && (
          <Button type="button" variant="outline" disabled={pending || deleting || confirmingDelete} onClick={() => setConfirmingDelete(true)} className="mr-auto border-red-200 font-black text-red-700 hover:bg-red-50 hover:text-red-800">
            <Trash2 className="h-4 w-4" />
            Delete recipient
          </Button>
        )}
        <DialogClose asChild><Button type="button" variant="ghost" disabled={pending || deleting}>Cancel</Button></DialogClose>
        <Button className="min-w-36 bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]" type="submit" disabled={pending || deleting || saved} aria-busy={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {pending ? pendingSubmit : saved ? 'Saved' : submit}
        </Button>
      </DialogFooter>
    </>
  )
}

function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return <label className={`${labelClass} ${className}`}><span>{label}</span>{children}{hint && <span className="text-xs font-semibold normal-case leading-5 tracking-normal text-[#728196]">{hint}</span>}</label>
}
