'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function revalidateAll(slug: string) {
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/admin/product-management')
  revalidatePath('/sitemap.xml')
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createProduct(
  formData: FormData,
  images: string[],
  description: object
) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const name         = String(formData.get('name') ?? '')
  const slug         = String(formData.get('slug') ?? '') || slugify(name)
  const pricing_type = String(formData.get('pricing_type') ?? 'fixed') as 'fixed' | 'quote'
  const price        = pricing_type === 'quote' ? 0 : parseFloat(String(formData.get('price') ?? '0'))
  const currency     = String(formData.get('currency') ?? 'KES')
  const category     = String(formData.get('category') ?? '') || null
  const brand        = String(formData.get('brand') ?? '') || null
  const stock        = parseInt(String(formData.get('stock') ?? '0'), 10)
  const is_active    = formData.get('is_active') === 'true'
  const seo_title    = String(formData.get('seo_title') ?? '') || null
  const seo_desc     = String(formData.get('seo_description') ?? '') || null
  const seo_keywords = String(formData.get('seo_keywords') ?? '') || null

  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description: JSON.stringify(description),
      price,
      currency,
      pricing_type,
      category,
      brand,
      stock,
      images,
      is_active,
      seo_title,
      seo_description: seo_desc,
      seo_keywords,
    })
    .select('id, slug')
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  revalidateAll(slug)
  return { success: true, id: data?.id }
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  formData: FormData,
  images: string[],
  description: object
) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const name         = String(formData.get('name') ?? '')
  const slug         = String(formData.get('slug') ?? '') || slugify(name)
  const pricing_type = String(formData.get('pricing_type') ?? 'fixed') as 'fixed' | 'quote'
  const price        = pricing_type === 'quote' ? 0 : parseFloat(String(formData.get('price') ?? '0'))
  const currency     = String(formData.get('currency') ?? 'KES')
  const category     = String(formData.get('category') ?? '') || null
  const brand        = String(formData.get('brand') ?? '') || null
  const stock        = parseInt(String(formData.get('stock') ?? '0'), 10)
  const is_active    = formData.get('is_active') === 'true'
  const seo_title    = String(formData.get('seo_title') ?? '') || null
  const seo_desc     = String(formData.get('seo_description') ?? '') || null
  const seo_keywords = String(formData.get('seo_keywords') ?? '') || null

  const { error } = await supabase
    .from('products')
    .update({
      name,
      slug,
      description: JSON.stringify(description),
      price,
      currency,
      pricing_type,
      category,
      brand,
      stock,
      images,
      is_active,
      seo_title,
      seo_description: seo_desc,
      seo_keywords,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateAll(slug)
  return { success: true }
}

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────

export async function deleteProduct(id: string) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const { data: product } = await supabase
    .from('products')
    .select('slug')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  if (product) revalidateAll(product.slug)
  return { success: true }
}

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────

export async function toggleProductStatus(id: string, is_active: boolean) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const { data: product } = await supabase
    .from('products')
    .select('slug')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('products')
    .update({ is_active })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  if (product) revalidateAll(product.slug)
  return { success: true }
}
