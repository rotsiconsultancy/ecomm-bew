import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Truck,
  Download,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  Package
} from 'lucide-react';

export default function OrderManagementPage() {
  const orders = [
    { id: 'BW-ORD-2023-4412', customer: 'Global Construct Ltd', location: 'London, UK', items: 12, amount: '€3,240.00', status: 'In Transit', date: 'Nov 12, 2023' },
    { id: 'BW-ORD-2023-4411', customer: 'Berlin Industrial Gmbh', location: 'Berlin, DE', items: 5, amount: '€12,890.00', status: 'Pending', date: 'Nov 12, 2023' },
    { id: 'BW-ORD-2023-4410', customer: 'Madrid Materials SA', location: 'Madrid, ES', items: 24, amount: '€5,412.00', status: 'Delivered', date: 'Nov 11, 2023' },
    { id: 'BW-ORD-2023-4409', customer: 'Paris Build Corp', location: 'Paris, FR', items: 8, amount: '€1,890.50', status: 'Delivered', date: 'Nov 11, 2023' },
    { id: 'BW-ORD-2023-4408', customer: 'Warsaw Wood Works', location: 'Warsaw, PL', items: 15, amount: '€2,450.00', status: 'Processing', date: 'Nov 10, 2023' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-2">Monitor, process, and track all wholesale orders.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="border-gray-200 rounded-[8px] font-bold h-12 px-6">
                <Download className="mr-2 h-5 w-5" />
                Export CSV
            </Button>
            <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12 px-8">
                Create New Order
            </Button>
        </div>
      </div>

      {/* Order Filters */}
      <Card className="rounded-[8px] border-none shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Input className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] w-full" placeholder="Search order ID or customer..." type="text" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <Calendar className="h-4 w-4" />
                    <span>Select Dates</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <Filter className="h-4 w-4" />
                    <span>Filter By Status</span>
                </Button>
            </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-[8px] border-none shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                <tr>
                    <th className="px-8 py-4">Order Reference</th>
                    <th className="px-8 py-4">Customer Details</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-center">Items</th>
                    <th className="px-8 py-4 text-right">Order Amount</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 cursor-pointer group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-brand-navy/5 rounded-[8px] flex items-center justify-center">
                                    <Package className="h-4 w-4 text-brand-navy" />
                                </div>
                                <div>
                                    <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">{order.id}</p>
                                    <p className="text-xs text-gray-400 font-semibold">{order.date}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="space-y-0.5">
                                <p className="font-bold text-gray-700">{order.customer}</p>
                                <p className="text-xs text-gray-400">{order.location}</p>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <Badge className={`border-none px-3 py-1 flex items-center gap-1 w-fit font-bold ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                order.status === 'In Transit' ? 'bg-blue-100 text-blue-600' :
                                order.status === 'Processing' ? 'bg-purple-100 text-purple-600' :
                                'bg-yellow-100 text-yellow-600'
                            }`}>
                                {order.status === 'Delivered' ? <CheckCircle2 className="h-3 w-3" /> :
                                 order.status === 'In Transit' ? <Truck className="h-3 w-3" /> :
                                 order.status === 'Processing' ? <Package className="h-3 w-3" /> :
                                 <Clock className="h-3 w-3" />}
                                {order.status}
                            </Badge>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-gray-600">{order.items} items</td>
                        <td className="px-8 py-6 text-right font-extrabold text-brand-navy">{order.amount}</td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><ChevronRight className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">Showing 1 to 5 of 1,248 orders</p>
          <div className="flex gap-2">
              <Button variant="outline" disabled className="rounded-[8px]">Previous</Button>
              <Button variant="outline" className="rounded-[8px] hover:bg-brand-navy hover:text-white transition-colors">Next</Button>
          </div>
      </div>
    </div>
  );
}
