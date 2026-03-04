import { MetadataRoute } from 'next'
import { createBuildClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
  { url: `${SITE_URL}/products`, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/resources`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/request-quote`, changeFrequency: 'monthly', priority: 0.7 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createBuildClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, content_type, updated_at')
    .eq('status', 'published')

  const dynamic: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/${post.content_type === 'blog' ? 'blog' : 'resources'}/${post.slug}`,
    lastModified: new Date(post.updated_at ?? Date.now()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...dynamic]
}
