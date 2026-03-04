import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'
import { notFound } from 'next/navigation'
import ContentForm from '../../content-form'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: Props) {
  await getAdminContext()
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!post) notFound()

  // Map Supabase row to the shape ContentForm expects
  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    content_type: post.content_type ?? 'blog',
    author_name: post.author_name,
    category: post.category,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    pdf_url: post.pdf_url,
    seo_title: post.seo_title,
    seo_description: post.seo_description,
    seo_keywords: post.seo_keywords,
    status: post.status ?? 'draft',
  }

  return <ContentForm initialData={initialData} />
}
