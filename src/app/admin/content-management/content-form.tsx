'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, updatePost } from './actions'
import { Save, X, FileText, Image as ImageIcon, Globe } from 'lucide-react'
import TiptapEditor from '@/components/editor/tiptap-editor'
import { ImageUpload } from '@/components/ui/image-upload'

const CATEGORIES = [
  'Supply Chain', 'Timber Tech', 'Industrial Chemicals',
  'Sustainability', 'Market Trends', 'Logistics',
  'Safety & Compliance', 'Regulations', 'Product Guides',
]

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

interface PostData {
  id: string
  title: string
  slug: string
  content: string | null
  content_type: string
  author_name: string | null
  category: string | null
  excerpt: string | null
  cover_image: string | null
  pdf_url: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  status: string
}

interface ContentFormProps {
  initialData?: PostData
}

export default function ContentForm({ initialData }: ContentFormProps) {
  const router = useRouter()
  const [loading, setLoading]       = useState(false)
  const [slug, setSlug]             = useState(initialData?.slug ?? '')
  const [coverImage, setCoverImage] = useState(initialData?.cover_image ?? '')

  const parsedContent = (() => {
    if (!initialData?.content) return null
    try { return JSON.parse(initialData.content) } catch { return null }
  })()

  const [tiptapContent, setTiptapContent] = useState<object>(parsedContent ?? {})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('slug', slug)
    const result = initialData
      ? await updatePost(initialData.id, formData, tiptapContent)
      : await createPost(formData, tiptapContent)
    if (result.success) {
      router.push('/admin/content-management')
      router.refresh()
    } else {
      alert('Error: ' + result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">
            {initialData ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {initialData ? `Editing: ${initialData.slug}` : 'Fill in the details below'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title *</label>
            <input
              name="title"
              required
              defaultValue={initialData?.title}
              onChange={(e) => { if (!initialData) setSlug(generateSlug(e.target.value)) }}
              placeholder="Enter a compelling title…"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Content *</label>
            <TiptapEditor content={parsedContent} onChange={setTiptapContent} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Excerpt / Summary</label>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={initialData?.excerpt ?? ''}
              placeholder="A short description shown on listing pages and in search results…"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 border-b pb-3">Publishing</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status ?? 'draft'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Content Type</label>
              <select
                name="content_type"
                defaultValue={initialData?.content_type ?? 'blog'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              >
                <option value="blog">📝 Blog Post</option>
                <option value="resource">📖 Technical Resource</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slug (URL)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-500 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 border-b pb-3">Author & Category</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Author Name *</label>
              <input
                name="author_name"
                required
                defaultValue={initialData?.author_name ?? 'Bewama Team'}
                placeholder="e.g. Dr. Sarah Mitchell"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <input
                name="category"
                list="categories"
                defaultValue={initialData?.category ?? ''}
                placeholder="Select or type a category…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
              <datalist id="categories">
                {CATEGORIES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" /> Media & Files
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Cover Image</label>
              {/* Hidden input so FormData picks up the URL */}
              <input type="hidden" name="cover_image" value={coverImage} />
              <ImageUpload
                bucket="blog-images"
                value={coverImage || null}
                onChange={setCoverImage}
                aspectRatio="video"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                PDF / Spec Sheet URL
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Resources</span>
              </label>
              <input
                name="pdf_url"
                defaultValue={initialData?.pdf_url ?? ''}
                placeholder="https://…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" /> SEO
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SEO Title</label>
              <input
                name="seo_title"
                defaultValue={initialData?.seo_title ?? ''}
                placeholder="Defaults to post title"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Meta Description</label>
              <textarea
                name="seo_description"
                rows={3}
                defaultValue={initialData?.seo_description ?? ''}
                placeholder="150–160 characters for best results…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Keywords</label>
              <input
                name="seo_keywords"
                defaultValue={initialData?.seo_keywords ?? ''}
                placeholder="comma, separated, keywords"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
