import { createClient, createBuildClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata, ResolvingMetadata } from 'next'
import { Calendar, User, ArrowLeft, Download, FileText, Clock } from 'lucide-react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const supabase = createBuildClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
    .eq('content_type', 'resource')
  return (data ?? []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image, seo_title, seo_description, seo_keywords, author_name, created_at')
    .eq('slug', slug)
    .eq('content_type', 'resource')
    .maybeSingle()

  if (!post) return { title: 'Not Found' }

  const title = post.seo_title ?? post.title
  const description = post.seo_description ?? post.excerpt ?? ''

  return {
    title: `${title} | Bewama Technical Resources`,
    description,
    keywords: post.seo_keywords ?? undefined,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bewama.com'}/resources/${slug}` },
    openGraph: {
      title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author_name ?? 'Bewama Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('content_type', 'resource')
    .eq('status', 'published')
    .maybeSingle()

  if (!post) notFound()

  let htmlContent = ''
  try {
    const tiptapJson = JSON.parse(post.content ?? '{}')
    htmlContent = generateHTML(tiptapJson, [StarterKit, Underline, TiptapImage, TiptapLink])
  } catch {
    htmlContent = '<p>Content unavailable.</p>'
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.excerpt ?? post.seo_description,
    image: post.cover_image,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: { '@type': 'Person', name: post.author_name ?? 'Bewama Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Bewama',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/resources/${slug}` },
  }

  return (
    <article className="bg-white min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <Link
          href="/resources"
          className="inline-flex items-center text-slate-500 hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to all resources
        </Link>

        <div className="space-y-6">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 text-orange-700">
            {post.category ?? 'Technical Resource'}
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold text-secondary leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-slate-500 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
                {(post.author_name ?? 'B')[0].toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-800">{post.author_name ?? 'Bewama Team'}</p>
                <p className="text-xs">Technical Specialist</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              {post.read_time_minutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.read_time_minutes} min read
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {post.cover_image && (
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <div className="relative h-100 md:h-150 rounded-3xl overflow-hidden shadow-2xl">
            <Image src={post.cover_image} alt={post.title} fill className="object-cover" priority />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <div
              className="prose prose-lg prose-slate max-w-none prose-headings:text-secondary prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          <div className="lg:col-span-1 space-y-8">
            {post.pdf_url && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <h4 className="font-bold text-secondary mb-4 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" /> Downloads
                </h4>
                <a
                  href={post.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-primary transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-600 truncate mr-2">Technical Spec Sheet.pdf</span>
                  <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </a>
              </div>
            )}

            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
              <h4 className="font-bold text-secondary mb-2 text-sm">Need help?</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Contact our Nairobi-based logistics team for sourcing and technical support.
              </p>
              <Link
                href="/contact"
                className="block text-center py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                Contact Sales
              </Link>
            </div>

            <div className="bg-secondary p-6 rounded-3xl text-white space-y-3">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <User className="w-4 h-4" /> About the Author
              </h4>
              <p className="font-bold">{post.author_name ?? 'Bewama Team'}</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Industrial specialist at Bewama with deep expertise in supply chain, construction materials, and logistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
