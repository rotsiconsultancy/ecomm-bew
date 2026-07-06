'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

// ─── Shared upload helper ─────────────────────────────────────────────────────

async function uploadToStorage(
  bucket: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!file.type.startsWith('image/')) return { error: 'Please select an image file.' }
  if (file.size > 10 * 1024 * 1024) return { error: 'File too large (max 10 MB).' }

  const supabase = createClient()
  const ext      = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return { url: data.publicUrl }
}

// ─── ImageUpload — single image with preview (for cover images) ───────────────

interface ImageUploadProps {
  bucket: string
  value?: string | null
  onChange: (url: string) => void
  className?: string
  aspectRatio?: 'video' | 'square'
}

export function ImageUpload({
  bucket,
  value,
  onChange,
  className,
  aspectRatio = 'video',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [dragOver, setDragOver]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handle(file: File) {
    setUploading(true)
    setError(null)
    const result = await uploadToStorage(bucket, file)
    if ('error' in result) {
      setError(result.error)
    } else {
      onChange(result.url)
    }
    setUploading(false)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handle(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handle(file)
  }

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'

  return (
    <div className={className}>
      {value ? (
        <div className={`relative group rounded-xl overflow-hidden border border-slate-200 ${aspectClass} bg-slate-50`}>
          <Image
            src={value}
            alt="Upload preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 bg-white text-slate-800 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${aspectClass} flex flex-col items-center justify-center ${
            dragOver
              ? 'border-[#ff5f14] bg-orange-50'
              : 'border-slate-200 hover:border-[#061f3f] hover:bg-slate-50'
          } ${uploading ? 'pointer-events-none' : ''}`}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#ff5f14] animate-spin mb-2" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
          )}
          <p className="text-sm font-medium text-slate-500">
            {uploading ? 'Uploading…' : 'Click or drag & drop'}
          </p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP · max 10 MB</p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  )
}

// ─── ImageUploadButton — inline upload button for multi-image lists ───────────

interface ImageUploadButtonProps {
  bucket: string
  onUploaded: (url: string) => void
  className?: string
}

export function ImageUploadButton({ bucket, onUploaded, className }: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setError(null)
    const result = await uploadToStorage(bucket, file)
    if ('error' in result) {
      setError(result.error)
    } else {
      onUploaded(result.url)
    }
    setUploading(false)
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {uploading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  )
}
