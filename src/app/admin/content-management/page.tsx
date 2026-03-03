import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Plus
} from 'lucide-react';

export default function ContentManagementPage() {
  const content = [
    { id: 'ART-104', title: 'Optimizing Your Industrial Supply Chain for 2024', type: 'Article', category: 'Supply Chain', author: 'Dr. Sarah Mitchell', status: 'Published', date: 'Oct 24, 2023' },
    { id: 'ART-103', title: 'Sustainable Timber: Regulations and Standards in Europe', type: 'Article', category: 'Sustainability', author: 'Mark Henderson', status: 'Published', date: 'Oct 18, 2023' },
    { id: 'ART-102', title: 'Advanced Sealants: Choosing the Right Adhesive', type: 'Article', category: 'Chemicals', author: 'Emma Collins', status: 'Published', date: 'Oct 12, 2023' },
    { id: 'PG-05', title: 'Wholesale Solutions for Manufacturing', type: 'Landing Page', category: 'Marketing', author: 'Marketing Team', status: 'Draft', date: 'Oct 05, 2023' },
    { id: 'RES-01', title: 'Global Materials Price Index Q3 2023', type: 'Resource', category: 'Market Analysis', author: 'Bewama Analytics', status: 'Archived', date: 'Sep 28, 2023' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">Content Management</h1>
          <p className="text-gray-500 mt-2">Create, edit, and publish technical resources and marketing content.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12 px-8">
                <Plus className="mr-2 h-5 w-5" />
                Create New Content
            </Button>
        </div>
      </div>

      {/* Content Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[8px] border-none shadow-sm p-6 space-y-2">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Published Articles</p>
            <p className="text-3xl font-extrabold text-brand-navy text-center">48</p>
        </Card>
        <Card className="rounded-[8px] border-none shadow-sm p-6 space-y-2">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Drafts in Progress</p>
            <p className="text-3xl font-extrabold text-brand-orange text-center">7</p>
        </Card>
        <Card className="rounded-[8px] border-none shadow-sm p-6 space-y-2">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Technical Whitepapers</p>
            <p className="text-3xl font-extrabold text-brand-navy text-center">15</p>
        </Card>
      </div>

      {/* Content Filters */}
      <Card className="rounded-[8px] border-none shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Input className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] w-full" placeholder="Search by title, author, or keyword..." type="text" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Content Type</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <Filter className="h-4 w-4" />
                    <span>Category</span>
                </Button>
            </div>
        </div>
      </Card>

      {/* Content Table */}
      <Card className="rounded-[8px] border-none shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                <tr>
                    <th className="px-8 py-4">Title & Type</th>
                    <th className="px-8 py-4">Author</th>
                    <th className="px-8 py-4 text-center">Category</th>
                    <th className="px-8 py-4 text-center">Status</th>
                    <th className="px-8 py-4">Last Updated</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {content.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 cursor-pointer group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-brand-navy/5 rounded-[8px] flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-brand-navy" />
                                </div>
                                <div>
                                    <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors truncate max-w-xs">{item.title}</p>
                                    <p className="text-xs text-gray-400 font-semibold">{item.type} • {item.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6 font-semibold text-gray-600">{item.author}</td>
                        <td className="px-8 py-6 text-center">
                            <Badge variant="outline" className="font-bold border-gray-200 text-gray-500">{item.category}</Badge>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex justify-center">
                                <Badge className={`border-none px-3 py-1 flex items-center gap-1 w-fit font-bold ${
                                    item.status === 'Published' ? 'bg-green-100 text-green-600' :
                                    item.status === 'Draft' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {item.status === 'Published' ? <CheckCircle2 className="h-3 w-3" /> :
                                     item.status === 'Draft' ? <Edit2 className="h-3 w-3" /> :
                                     <Clock className="h-3 w-3" />}
                                    {item.status}
                                </Badge>
                            </div>
                        </td>
                        <td className="px-8 py-6 font-semibold text-gray-600">{item.date}</td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-orange"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">Showing 1 to 5 of 84 content pieces</p>
          <div className="flex gap-2">
              <Button variant="outline" disabled className="rounded-[8px]">Previous</Button>
              <Button variant="outline" className="rounded-[8px] hover:bg-brand-navy hover:text-white transition-colors">Next</Button>
          </div>
      </div>
    </div>
  );
}
