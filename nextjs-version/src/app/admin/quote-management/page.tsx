import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Download,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function QuoteManagementPage() {
  const quotes = [
    { id: 'BW-Q-2023-8842', customer: 'Global Construct Ltd', location: 'London, UK', items: 250, value: 'Est. €7,048.56', status: 'Pending', date: 'Nov 12, 2023' },
    { id: 'BW-Q-2023-8841', customer: 'Berlin Industrial Gmbh', location: 'Berlin, DE', items: 50, value: 'Est. €12,890.00', status: 'In Review', date: 'Nov 12, 2023' },
    { id: 'BW-Q-2023-8840', customer: 'Madrid Materials SA', location: 'Madrid, ES', items: 100, value: '€5,412.00', status: 'Converted', date: 'Nov 11, 2023' },
    { id: 'BW-Q-2023-8839', customer: 'Paris Build Corp', location: 'Paris, FR', items: 12, value: '€1,890.50', status: 'Rejected', date: 'Nov 11, 2023' },
    { id: 'BW-Q-2023-8838', customer: 'Warsaw Wood Works', location: 'Warsaw, PL', items: 500, value: 'Est. €14,500.00', status: 'Pending', date: 'Nov 10, 2023' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">Quote Management</h1>
          <p className="text-gray-500 mt-2">Manage wholesale price requests and lead conversions.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="border-gray-200 rounded-[8px] font-bold h-12 px-6">
                <Download className="mr-2 h-5 w-5" />
                Export Reports
            </Button>
            <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12 px-8">
                Create New Quote
            </Button>
        </div>
      </div>

      {/* Quote Filters */}
      <Card className="rounded-[8px] border-none shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Input className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] w-full" placeholder="Search quote ID or customer..." type="text" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <User className="h-4 w-4" />
                    <span>Assigned To Me</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <Filter className="h-4 w-4" />
                    <span>Filter By Type</span>
                </Button>
            </div>
        </div>
      </Card>

      {/* Quotes Table */}
      <Card className="rounded-[8px] border-none shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                <tr>
                    <th className="px-8 py-4">Quote ID</th>
                    <th className="px-8 py-4">Company Details</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-center">Items</th>
                    <th className="px-8 py-4 text-right">Estimated Value</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50/50 cursor-pointer group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-brand-navy/5 rounded-[8px] flex items-center justify-center">
                                    <MessageSquare className="h-4 w-4 text-brand-navy" />
                                </div>
                                <div>
                                    <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">{quote.id}</p>
                                    <p className="text-xs text-gray-400 font-semibold">{quote.date}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="space-y-0.5">
                                <p className="font-bold text-gray-700">{quote.customer}</p>
                                <p className="text-xs text-gray-400">{quote.location}</p>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <Badge className={`border-none px-3 py-1 flex items-center gap-1 w-fit font-bold ${
                                quote.status === 'Converted' ? 'bg-green-100 text-green-600' :
                                quote.status === 'In Review' ? 'bg-blue-100 text-blue-600' :
                                quote.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-600'
                            }`}>
                                {quote.status === 'Converted' ? <CheckCircle2 className="h-3 w-3" /> :
                                 quote.status === 'In Review' ? <Search className="h-3 w-3" /> :
                                 quote.status === 'Rejected' ? <Clock className="h-3 w-3" /> :
                                 <Clock className="h-3 w-3" />}
                                {quote.status}
                            </Badge>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-gray-600">{quote.items} units</td>
                        <td className="px-8 py-6 text-right font-extrabold text-brand-navy">{quote.value}</td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><ChevronRight className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><ExternalLink className="h-4 w-4" /></Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">Showing 1 to 5 of 842 quotes</p>
          <div className="flex gap-2">
              <Button variant="outline" disabled className="rounded-[8px]">Previous</Button>
              <Button variant="outline" className="rounded-[8px] hover:bg-brand-navy hover:text-white transition-colors">Next</Button>
          </div>
      </div>
    </div>
  );
}
