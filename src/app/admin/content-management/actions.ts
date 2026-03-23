'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'

export type ContentType = 'blog' | 'resource'
export type ContentStatus = 'draft' | 'published'

function extractText(node: Record<string, unknown>): string {
  if (node.type === 'text') return String(node.text ?? '')
  const content = node.content as Record<string, unknown>[] | undefined
  if (content) return content.map(extractText).join(' ')
  return ''
}

function estimateReadTime(tiptapJson: Record<string, unknown>): number {
  const text = extractText(tiptapJson)
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(wordCount / 200))
}

async function pingIndexNow(path: string) {
  const key = process.env.INDEXNOW_KEY
  const siteUrl = process.env.NODE_ENV === 'production' ? 'https://bewama.com' : ''
  // Only ping in production
  if (!key || !siteUrl) return
  try {
    const host = new URL(siteUrl).hostname
    await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, key, urlList: [`${siteUrl}${path}`] }),
    })
  } catch {
    // Non-blocking — never fail a publish due to IndexNow
  }
}

function revalidateAll(slug: string, contentType: ContentType) {
  const basePath = contentType === 'blog' ? '/blog' : '/resources'
  revalidatePath(basePath)
  revalidatePath(`${basePath}/${slug}`)
  revalidatePath('/admin/content-management')
  revalidatePath('/sitemap.xml')
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createPost(formData: FormData, tiptapContent: object) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const title        = String(formData.get('title') ?? '')
  const slug         = String(formData.get('slug') ?? '')
  const contentType  = String(formData.get('content_type') ?? 'blog') as ContentType
  const authorName   = String(formData.get('author_name') ?? 'Bewama Team')
  const category     = String(formData.get('category') ?? '') || null
  const excerpt      = String(formData.get('excerpt') ?? '') || null
  const coverImage   = String(formData.get('cover_image') ?? '') || null
  const pdfUrl       = String(formData.get('pdf_url') ?? '') || null
  const seoTitle     = String(formData.get('seo_title') ?? '') || null
  const seoDesc      = String(formData.get('seo_description') ?? '') || null
  const seoKeywords  = String(formData.get('seo_keywords') ?? '') || null
  const status       = String(formData.get('status') ?? 'draft') as ContentStatus
  const readTime     = estimateReadTime(tiptapContent as Record<string, unknown>)
  
  const overrideStr  = String(formData.get('published_at_override') ?? '')
  const parsedOverride = overrideStr ? new Date(overrideStr).toISOString() : null

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      content: JSON.stringify(tiptapContent),
      content_type: contentType,
      author_name: authorName,
      category,
      excerpt,
      cover_image: coverImage,
      pdf_url: pdfUrl,
      seo_title: seoTitle,
      seo_description: seoDesc,
      seo_keywords: seoKeywords,
      status,
      read_time_minutes: readTime,
      published_at: parsedOverride || (status === 'published' ? new Date().toISOString() : null),
    })
    .select('id, slug, content_type')
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (status === 'published' && data) {
    const basePath = contentType === 'blog' ? '/blog' : '/resources'
    await pingIndexNow(`${basePath}/${slug}`)
  }

  revalidateAll(slug, contentType)
  return { success: true, id: data?.id }
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export async function updatePost(id: string, formData: FormData, tiptapContent: object) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const title        = String(formData.get('title') ?? '')
  const slug         = String(formData.get('slug') ?? '')
  const contentType  = String(formData.get('content_type') ?? 'blog') as ContentType
  const authorName   = String(formData.get('author_name') ?? 'Bewama Team')
  const category     = String(formData.get('category') ?? '') || null
  const excerpt      = String(formData.get('excerpt') ?? '') || null
  const coverImage   = String(formData.get('cover_image') ?? '') || null
  const pdfUrl       = String(formData.get('pdf_url') ?? '') || null
  const seoTitle     = String(formData.get('seo_title') ?? '') || null
  const seoDesc      = String(formData.get('seo_description') ?? '') || null
  const seoKeywords  = String(formData.get('seo_keywords') ?? '') || null
  const status       = String(formData.get('status') ?? 'draft') as ContentStatus
  const readTime     = estimateReadTime(tiptapContent as Record<string, unknown>)
  
  const overrideStr  = String(formData.get('published_at_override') ?? '')
  const parsedOverride = overrideStr ? new Date(overrideStr).toISOString() : null

  // Fetch previous status to detect draft→published transition
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('status, published_at')
    .eq('id', id)
    .maybeSingle()

  const justPublished = status === 'published' && existing?.status !== 'published'

  const { error } = await supabase
    .from('blog_posts')
    .update({
      title,
      slug,
      content: JSON.stringify(tiptapContent),
      content_type: contentType,
      author_name: authorName,
      category,
      excerpt,
      cover_image: coverImage,
      pdf_url: pdfUrl,
      seo_title: seoTitle,
      seo_description: seoDesc,
      seo_keywords: seoKeywords,
      status,
      read_time_minutes: readTime,
      published_at: parsedOverride || (justPublished
        ? new Date().toISOString()
        : existing?.published_at ?? null),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  if (justPublished) {
    const basePath = contentType === 'blog' ? '/blog' : '/resources'
    await pingIndexNow(`${basePath}/${slug}`)
  }

  revalidateAll(slug, contentType)
  return { success: true }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deletePost(id: string) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('slug, content_type')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  if (post) revalidateAll(post.slug, post.content_type as ContentType)
  return { success: true }
}
