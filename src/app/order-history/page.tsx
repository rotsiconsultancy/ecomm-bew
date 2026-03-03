import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, ShoppingCart, User, Settings, MessageSquare, LogOut, ChevronRight, Truck, Clock, CheckCircle2, Download, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function OrderHistoryPage() {
  const orders = [
    { id: 'BW-ORD-2023-4412', date: 'Nov 12, 2023', status: 'In Transit', amount: '€3,240.00', items: 12, type: 'Order' },
    { id: 'BW-ORD-2023-3982', date: 'Oct 28, 2023', status: 'Delivered', amount: '€1,890.50', items: 8, type: 'Order' },
    { id: 'BW-ORD-2023-2874', date: 'Sep 15, 2023', status: 'Delivered', amount: '€5,412.00', items: 24, type: 'Order' },
    { id: 'BW-ORD-2023-1563', date: 'Aug 04, 2023', status: 'Cancelled', amount: '€890.00', items: 4, type: 'Order' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Profile Navigation Sidebar (Shared with Profile) */}
        <aside className="w-full lg:w-80 space-y-8">
            <nav className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="/profile">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Account Overview</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 bg-brand-navy text-white font-bold" href="/order-history">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Order History</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="#">
                    <MessageSquare className="h-5 w-5" />
                    <span>Quote Requests</span>
                    <Badge className="ml-auto bg-brand-orange">2</Badge>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="#">
                    <Settings className="h-5 w-5" />
                    <span>Company Settings</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-red-600 hover:bg-red-50 transition-colors" href="/login">
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </Link>
            </nav>
        </aside>

        {/* Order History Content */}
        <div className="lg:flex-1 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-brand-navy">Order History</h1>
                    <p className="text-gray-500 mt-2">Manage and track your wholesale purchases.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input className="pl-10 pr-4 py-2 border border-gray-300 rounded-[8px] w-64" placeholder="Search orders..." type="text" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                    <Button variant="outline" className="flex items-center gap-2 border-gray-300 rounded-[8px]">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </Button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                        <tr>
                            <th className="px-8 py-4">Reference</th>
                            <th className="px-8 py-4">Date</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Items</th>
                            <th className="px-8 py-4">Amount</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 cursor-pointer group">
                                <td className="px-8 py-6 font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                                    <Link href="/order-details">
                                        {order.id}
                                    </Link>
                                </td>
                                <td className="px-8 py-6 font-semibold text-gray-600">{order.date}</td>
                                <td className="px-8 py-6">
                                    <Badge className={`border-none px-3 py-1 flex items-center gap-1 w-fit ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                        order.status === 'In Transit' ? 'bg-blue-100 text-blue-600' :
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                        'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {order.status === 'Delivered' ? <CheckCircle2 className="h-3 w-3" /> :
                                         order.status === 'In Transit' ? <Truck className="h-3 w-3" /> :
                                         order.status === 'Cancelled' ? <LogOut className="h-3 w-3" /> :
                                         <Clock className="h-3 w-3" />}
                                        {order.status}
                                    </Badge>
                                </td>
                                <td className="px-8 py-6 font-semibold text-gray-600">{order.items} items</td>
                                <td className="px-8 py-6 font-extrabold text-brand-navy">{order.amount}</td>
                                <td className="px-8 py-6 text-right">
                                    <Button variant="ghost" size="icon" className="hover:text-brand-orange">
                                        <Download className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href="/order-details">
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">Showing 1 to 4 of 12 orders</p>
                <div className="flex gap-2">
                    <Button variant="outline" disabled className="rounded-[8px]">Previous</Button>
                    <Button variant="outline" className="rounded-[8px] hover:bg-brand-navy hover:text-white transition-colors">Next</Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
