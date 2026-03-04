import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/auth'
import Link from 'next/link'
import { Plus, Edit, Globe, FileText } from 'lucide-react'
import DeletePostButton from './delete-post-button'

export default async function ContentManagementPage() {
  await getAdminContext()
  const supabase = await createClient()

  const { data: contents } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content_type, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Content Management</h1>
          <p className="text-slate-500">Manage your blogs and technical resources</p>
        </div>
        <Link
          href="/admin/content-management/new"
          className="bg-primary text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Create New Content
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(contents ?? []).map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-400">/{item.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    item.content_type === 'blog'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}>
                    {item.content_type === 'blog' ? <Globe className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {item.content_type === 'blog' ? 'Blog Post' : 'Technical Resource'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link
                    href={`/admin/content-management/${item.id}/edit`}
                    className="inline-block p-2 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <DeletePostButton id={item.id} />
                </td>
              </tr>
            ))}
            {(contents ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No content found. Start by creating your first post!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
