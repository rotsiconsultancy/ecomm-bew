import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { Calendar, User, ArrowRight, BookOpen, Settings } from 'lucide-react'

export const revalidate = 3600

const SITE_URL = 'https://bewama.com'

export const metadata: Metadata = {
  title: 'Technical Resources & Blog | Bewama Industrial',
  description: 'Deep dives into industrial solutions, hardware guides, and construction material insights from the Bewama team.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Technical Resources & Blog | Bewama Industrial',
    description: 'Deep dives into industrial solutions, hardware guides, and construction material insights from the Bewama team.',
    type: 'website',
    url: `${SITE_URL}/blog`,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Bewama' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technical Resources & Blog | Bewama Industrial',
    description: 'Deep dives into industrial solutions, hardware guides, and construction material insights from the Bewama team.',
  },
}

export default async function BlogListingPage() {
  const supabase = await createClient()

  const { data: contents } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content_type, author_name, category, excerpt, cover_image, read_time_minutes, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Technical Resources & Blog</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Deep dives into industrial solutions, hardware guides, and construction material insights.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(contents ?? []).map((post) => (
            <Link
              key={post.id}
              href={post.content_type === 'blog' ? `/blog/${post.slug}` : `/resources/${post.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                {post.cover_image ? (
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    {post.content_type === 'blog' ? <BookOpen className="w-16 h-16" /> : <Settings className="w-16 h-16" />}
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    post.content_type === 'blog'
                      ? 'bg-blue-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}>
                    {post.content_type === 'blog' ? 'Blog' : 'Resource'}
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {post.author_name ?? 'Bewama Team'}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-auto flex items-center text-primary font-bold text-sm">
                  Read Article <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(contents ?? []).length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 inline-block">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-secondary">No articles yet</h3>
              <p className="text-slate-500">Check back soon for technical insights.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
