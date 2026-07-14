'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitSupplierApplication } from './actions'

interface Props {
  defaultName: string
  defaultEmail: string
}

export function SupplierApplicationForm({ defaultName, defaultEmail }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await submitSupplierApplication(formData)
      if (result.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error ?? 'Failed to submit application.')
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-xl font-black text-green-800">Application received</h2>
        <p className="mt-2 text-sm font-semibold text-green-700">
          Bewama will review your supplier application and notify you once it is approved.
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-5 rounded-xl border border-[#d8e0ea] bg-white p-5 shadow-sm sm:p-7">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" name="company_name" required />
        <Field label="Contact name" name="contact_name" defaultValue={defaultName} required />
        <Field label="Email" name="email" type="email" defaultValue={defaultEmail} required />
        <Field label="Phone" name="phone" required />
        <Field label="KRA PIN" name="kra_pin" required />
        <Field label="Registration number" name="registration_number" required />
        <Field label="Location" name="location" required />
        <Field label="Website" name="website_url" type="url" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-black text-[#061f3f]">Product categories</label>
        <Input name="product_categories" required placeholder="Adhesives, Tools, Sealants" className="h-11" />
        <p className="mt-1 text-xs font-semibold text-gray-400">Separate categories with commas.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-black text-[#061f3f]">Business description</label>
        <textarea
          name="business_description"
          required
          rows={4}
          className="w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ff5f14]/20"
          placeholder="Tell us what your company supplies and where you operate."
        />
      </div>

      <Button disabled={isPending} className="h-12 w-full rounded-lg bg-[#ff5f14] font-black text-white hover:bg-[#e84f0a]">
        {isPending ? 'Submitting...' : 'Submit supplier application'}
      </Button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-black text-[#061f3f]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input name={name} type={type} required={required} defaultValue={defaultValue} className="h-11" />
    </div>
  )
}
