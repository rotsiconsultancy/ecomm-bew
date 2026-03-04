import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata, ResolvingMetadata } from 'next'
import { Calendar, User, ArrowLeft, Download, FileText, Share2 } from 'lucide-react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const contents = await prisma.content.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return contents.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.content.findUnique({
    where: { slug },
  })

  if (!post) return { title: 'Not Found' }

  return {
    title: `${post.title} | Bewama Industrial Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description || '',
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || '',
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.content.findUnique({
    where: { slug },
  })

  if (!post || !post.published) {
    notFound()
  }

  // Convert JSON content to HTML
  const htmlContent = generateHTML(post.content as any, [
    StarterKit,
    Underline,
    TiptapImage,
    TiptapLink,
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.type === 'BLOG' ? 'BlogPosting' : 'TechArticle',
    headline: post.title,
    description: post.description,
    image: post.featuredImage,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Bewama',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nairobi',
        addressCountry: 'Kenya'
      },
      logo: {
        '@type': 'ImageObject',
        url: 'https://bewama.com/logo.png', // Fallback
      },
    },
  }

  return (
    <article className="bg-white min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-slate-500 hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to all resources
        </Link>

        <div className="space-y-6">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            post.type === 'BLOG' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
          }`}>
            {post.type.replace('_', ' ')}
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold text-secondary leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-slate-500 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
                {post.author[0]}
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-800">{post.author}</p>
                <p className="text-xs">Technical Specialist</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {post.featuredImage && (
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <div className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
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
            {post.pdfUrl && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <h4 className="font-bold text-secondary mb-4 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" /> Downloads
                </h4>
                <a
                  href={post.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-primary transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-600 truncate mr-2">Technical Guide.pdf</span>
                  <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </a>
              </div>
            )}

            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
              <h4 className="font-bold text-secondary mb-2 text-sm">Need help?</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Contact our Nairobi-based logistics team for direct support.
              </p>
              <Link
                href="/contact"
                className="block text-center py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
