import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { Calendar, User, ArrowRight, Settings, FileText, Clock } from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Technical Resources | Bewama Industrial',
  description: 'Industry insights, technical guides, spec sheets, and professional advice from Bewama\'s industrial specialists.',
}

export default async function ResourcesPage() {
  const supabase = await createClient()

  const { data: resources } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, author_name, excerpt, cover_image, pdf_url, read_time_minutes, created_at')
    .eq('status', 'published')
    .eq('content_type', 'resource')
    .order('created_at', { ascending: false })

  const categories = [...new Set((resources ?? []).map((r) => r.category).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-secondary mb-2">Technical Resources</h1>
          <p className="text-slate-500">Industry insights, technical guides, and professional advice.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Resource Feed */}
        <div className="lg:col-span-3 space-y-10">
          {(resources ?? []).map((resource) => (
            <Link key={resource.id} href={`/resources/${resource.slug}`} className="group block">
              <div className="rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row gap-0 group-hover:shadow-xl transition-all bg-white">
                <div className="md:w-72 h-56 shrink-0 overflow-hidden bg-slate-100 relative">
                  {resource.cover_image ? (
                    <Image
                      src={resource.cover_image}
                      alt={resource.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <Settings className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-8 space-y-3">
                  {resource.category && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                      {resource.category}
                    </span>
                  )}
                  <h2 className="text-2xl font-extrabold text-secondary group-hover:text-primary transition-colors line-clamp-2">
                    {resource.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {resource.author_name ?? 'Bewama Team'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                    {resource.read_time_minutes && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {resource.read_time_minutes} min read
                      </span>
                    )}
                    {resource.pdf_url && (
                      <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                        <FileText className="h-4 w-4" />
                        PDF available
                      </span>
                    )}
                  </div>
                  {resource.excerpt && (
                    <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
                      {resource.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all pt-2">
                    <span>Read Full Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {(resources ?? []).length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 inline-block">
                <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-secondary">No resources yet</h3>
                <p className="text-slate-500">Check back soon for technical guides.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-10">
          {categories.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-secondary border-l-4 border-primary pl-4">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full text-sm bg-slate-100 text-slate-600 font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-secondary p-8 rounded-2xl text-white space-y-4 shadow-xl">
            <h3 className="text-xl font-bold">Get Expert Support</h3>
            <p className="text-sm text-slate-300">
              Our Nairobi-based specialists are ready to help with sourcing, logistics, and technical questions.
            </p>
            <Link
              href="/contact"
              className="block w-full text-center py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all"
            >
              Contact Our Team
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
