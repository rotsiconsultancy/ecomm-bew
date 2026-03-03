"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TiptapEditor from '@/components/editor/tiptap-editor'
import { createContent, updateContent } from './actions'
import { ContentType } from '@prisma/client'
import { Save, X, Image as ImageIcon, FileText } from 'lucide-react'

export default function ContentForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(initialData?.content || {})
  const [slug, setSlug] = useState(initialData?.slug || '')

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('slug', slug)

    const result = initialData
      ? await updateContent(initialData.id, formData, content)
      : await createContent(formData, content)

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
        <h1 className="text-3xl font-bold text-secondary">
          {initialData ? 'Edit Content' : 'Create New Content'}
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title</label>
            <input
              name="title"
              required
              defaultValue={initialData?.title}
              onChange={(e) => !initialData && setSlug(generateSlug(e.target.value))}
              placeholder="Enter title..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Content</label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">Publishing Settings</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Content Type</label>
              <select
                name="type"
                defaultValue={initialData?.type || ContentType.BLOG}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value={ContentType.BLOG}>Blog Post</option>
                <option value={ContentType.TECHNICAL_RESOURCE}>Technical Resource</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slug (URL)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="published"
                value="true"
                defaultChecked={initialData?.published}
                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
              />
              <label className="text-sm font-medium text-slate-700">Published</label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">SEO & Assets</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={initialData?.description}
                placeholder="SEO meta description..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Featured Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="featuredImage"
                  defaultValue={initialData?.featuredImage}
                  placeholder="https://..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">PDF URL (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="pdfUrl"
                  defaultValue={initialData?.pdfUrl}
                  placeholder="Link to technical PDF..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
