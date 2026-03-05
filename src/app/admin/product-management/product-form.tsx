'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import TiptapEditor from '@/components/editor/tiptap-editor'
import { ImageUploadButton } from '@/components/ui/image-upload'
import { createProduct, updateProduct } from './actions'
import {
  Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Loader2,
} from 'lucide-react'

const CATEGORIES = ['Silicones', 'Timber & Boards', 'Tools', 'Adhesives', 'Chemicals', 'Other']
const CURRENCIES = ['KES', 'EUR', 'USD']

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  category: string | null
  brand: string | null
  stock: number
  images: string[]
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
}

type Props =
  | { mode: 'create'; product?: undefined }
  | { mode: 'edit'; product: Product }

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // Deserialize stored TipTap JSON
  let initialContent: object | null = null
  if (product?.description) {
    try { initialContent = JSON.parse(product.description) } catch { /* ignore */ }
  }

  const [name, setName]           = useState(product?.name ?? '')
  const [slug, setSlug]           = useState(product?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(false)
  const [tiptapContent, setTiptapContent] = useState<object>(initialContent ?? {})
  const [images, setImages]       = useState<string[]>(product?.images ?? [])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isActive, setIsActive]   = useState(product?.is_active ?? true)
  const [seoOpen, setSeoOpen]     = useState(false)
  const [seoTitle, setSeoTitle]   = useState(product?.seo_title ?? '')
  const [seoDesc, setSeoDesc]     = useState(product?.seo_description ?? '')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  function handleNameChange(v: string) {
    setName(v)
    if (!slugEdited) setSlug(slugify(v))
  }

  function addImage() {
    const url = newImageUrl.trim()
    if (!url) return
    setImages((prev) => [...prev, url])
    setNewImageUrl('')
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(formRef.current!)
    formData.set('is_active', String(isActive))

    let result
    if (mode === 'edit') {
      result = await updateProduct(product.id, formData, images, tiptapContent)
    } else {
      result = await createProduct(formData, images, tiptapContent)
    }

    if (!result.success) {
      setError(result.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/admin/product-management')
    router.refresh()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Core fields ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-bold text-[#003366] text-lg">Product Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Silicone Sealant 300ml"
              className="h-11"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
              placeholder="auto-generated"
              className="h-11 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              bewama.com/products/<span className="text-[#ec5b13]">{slug || '…'}</span>
            </p>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
            <Input
              name="brand"
              defaultValue={product?.brand ?? ''}
              placeholder="e.g. Mapei, Bostik"
              className="h-11"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <Input
              name="category"
              list="category-list"
              defaultValue={product?.category ?? ''}
              placeholder="Select or type a category"
              className="h-11"
            />
            <datalist id="category-list">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price <span className="text-red-500">*</span>
            </label>
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price ?? ''}
              placeholder="0.00"
              className="h-11"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
            <select
              name="currency"
              defaultValue={product?.currency ?? 'KES'}
              className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Stock <span className="text-red-500">*</span>
            </label>
            <Input
              name="stock"
              type="number"
              min="0"
              required
              defaultValue={product?.stock ?? 0}
              className="h-11"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 pt-6">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-[#ec5b13]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {isActive ? 'Active (visible in store)' : 'Inactive (hidden from store)'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="font-bold text-[#003366] text-lg">Description</h2>
        <TiptapEditor content={initialContent} onChange={setTiptapContent} />
      </div>

      {/* ── Images ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-[#003366] text-lg">Product Images</h2>
        <p className="text-sm text-gray-500">Add image URLs. First image is used as the primary thumbnail.</p>

        {/* Add image — URL or file upload */}
        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste URL or upload a file →"
            className="h-10"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
          />
          <Button type="button" onClick={addImage} variant="outline" className="h-10 px-4 shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add URL
          </Button>
          <ImageUploadButton
            bucket="product-images"
            onUploaded={(url) => setImages((prev) => [...prev, url])}
          />
        </div>

        {/* Image list */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Product image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                />
                {idx === 0 && (
                  <Badge className="absolute top-1 left-1 text-[10px] bg-[#ec5b13] text-white border-none">
                    Primary
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No images added yet</p>
          </div>
        )}
      </div>

      {/* ── SEO Section (collapsible) ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setSeoOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <h2 className="font-bold text-[#003366] text-lg">SEO Settings</h2>
          {seoOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {seoOpen && (
          <div className="px-6 pb-6 space-y-5 border-t border-slate-100">
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                <span className={`text-xs ${seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                  {seoTitle.length}/60
                </span>
              </div>
              <Input
                name="seo_title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`${name || 'Product name'} | Bewama`}
                maxLength={70}
                className="h-11"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                <span className={`text-xs ${seoDesc.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                  {seoDesc.length}/160
                </span>
              </div>
              <textarea
                name="seo_description"
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                rows={3}
                maxLength={180}
                placeholder="Brief description for search engines…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Keywords</label>
              <Input
                name="seo_keywords"
                defaultValue={product?.seo_keywords ?? ''}
                placeholder="silicone sealant, waterproof, construction"
                className="h-11"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/product-management')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#ec5b13] hover:bg-[#d14d0d] text-white font-semibold px-8 h-11"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Saving…' : mode === 'edit' ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
