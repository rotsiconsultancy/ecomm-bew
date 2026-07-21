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

function getProductImagePath(url: string): string | null {
  try {
    const parsed = new URL(url)
    const marker = '/storage/v1/object/public/product-images/'
    const markerIndex = parsed.pathname.indexOf(marker)
    if (markerIndex === -1) return null
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length))
  } catch {
    return null
  }
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createProduct(
  formData: FormData,
  images: string[],
  description: string
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
      description,
      price,
      currency,
      pricing_type,
      category,
      brand,
      stock,
      images,
      is_active,
      product_status: is_active ? 'active' : 'inactive',
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
  description: string
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
      description,
      price,
      currency,
      pricing_type,
      category,
      brand,
      stock,
      images,
      is_active,
      product_status: is_active ? 'active' : 'inactive',
      seo_title,
      seo_description: seo_desc,
      seo_keywords,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateAll(slug)
  return { success: true }
}

// ─── DUPLICATE ───────────────────────────────────────────────────────────────────────────────

// Duplicate products are created hidden so the copy can be reviewed before publishing.
export async function duplicateProduct(id: string) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const { data: source, error: sourceError } = await supabase
    .from('products')
    .select('name, slug, description, price, currency, pricing_type, category, brand, stock, images, seo_title, seo_description, seo_keywords, supplier_id')
    .eq('id', id)
    .maybeSingle()

  if (sourceError) return { success: false, error: sourceError.message }
  if (!source) return { success: false, error: 'The product could not be found.' }

  const copySlug = `${source.slug}-copy-${Date.now().toString(36)}`
  const { data: copy, error: copyError } = await supabase
    .from('products')
    .insert({
      name: `${source.name} (Copy)`,
      slug: copySlug,
      description: source.description,
      price: source.price,
      currency: source.currency,
      pricing_type: source.pricing_type,
      category: source.category,
      brand: source.brand,
      stock: source.stock,
      images: source.images,
      is_active: false,
      product_status: 'inactive',
      seo_title: source.seo_title,
      seo_description: source.seo_description,
      seo_keywords: source.seo_keywords,
      supplier_id: source.supplier_id,
    })
    .select('id')
    .maybeSingle()

  if (copyError) return { success: false, error: copyError.message }
  if (!copy) return { success: false, error: 'The product copy could not be created.' }

  const { data: companions, error: companionsError } = await supabase
    .from('product_companions')
    .select('companion_product_id, sort_order')
    .eq('product_id', id)

  if (companionsError) {
    await supabase.from('products').delete().eq('id', copy.id)
    return { success: false, error: companionsError.message }
  }

  if (companions && companions.length > 0) {
    const { error: copyCompanionsError } = await supabase
      .from('product_companions')
      .insert(companions.map((companion) => ({
        product_id: copy.id,
        companion_product_id: companion.companion_product_id,
        sort_order: companion.sort_order,
      })))

    if (copyCompanionsError) {
      await supabase.from('products').delete().eq('id', copy.id)
      return { success: false, error: copyCompanionsError.message }
    }
  }

  revalidatePath('/admin/product-management')
  return { success: true, id: copy.id }
}

// ─── PERMANENT DELETE ──────────────────────────────────────────────────────────────────────────────

// Images shared with a duplicate are retained until the last referencing product is deleted.
export async function deleteProduct(id: string) {
  await getAdminContext()
  const supabase = await createServiceClient()

  const { data: product } = await supabase
    .from('products')
    .select('slug, images')
    .eq('id', id)
    .maybeSingle()

  const productImages = (product?.images ?? []) as string[]
  const sharedImageUrls = new Set<string>()
  let sharedImageLookupFailed = false

  if (productImages.length > 0) {
    const { data: productsSharingImages, error: sharedImageError } = await supabase
      .from('products')
      .select('images')
      .neq('id', id)
      .overlaps('images', productImages)

    sharedImageLookupFailed = Boolean(sharedImageError)
    for (const row of productsSharingImages ?? []) {
      for (const image of (row.images ?? []) as string[]) sharedImageUrls.add(image)
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  const imagePaths = productImages
    .filter((url) => !sharedImageUrls.has(url))
    .map(getProductImagePath)
    .filter((path): path is string => Boolean(path))

  let warning: string | undefined
  if (sharedImageLookupFailed) {
    warning = 'The product was deleted, but image cleanup was skipped to protect images that may be shared by a duplicate.'
  } else if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('product-images').remove(imagePaths)
    if (storageError) warning = `The product was deleted, but some uploaded images could not be removed: ${storageError.message}`
  }

  if (product?.slug) revalidateAll(product.slug)
  return { success: true, warning }
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
    .update({
      is_active,
      product_status: is_active ? 'active' : 'inactive',
      paused_at: null,
      paused_by: null,
      pause_reason: null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  if (product) revalidateAll(product.slug)
  return { success: true }
}
