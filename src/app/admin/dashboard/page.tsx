import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  MoreVertical,
  Plus
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Revenue', value: '€248,390.50', change: '+12.5%', icon: TrendingUp, color: 'text-green-600', trend: 'up' },
    { title: 'Active Orders', value: '42', change: '+8%', icon: ShoppingCart, color: 'text-brand-orange', trend: 'up' },
    { title: 'New Leads', value: '18', change: '-3%', icon: Users, color: 'text-blue-600', trend: 'down' },
    { title: 'Quote Requests', value: '7', change: '+15%', icon: MessageSquare, color: 'text-purple-600', trend: 'up' },
  ];

  const recentOrders = [
    { id: 'BW-ORD-2023-4412', customer: 'Global Construct Ltd', date: 'Nov 12, 2023', amount: '€3,240.00', status: 'In Transit' },
    { id: 'BW-ORD-2023-4411', customer: 'Berlin Industrial Gmbh', date: 'Nov 12, 2023', amount: '€12,890.00', status: 'Pending' },
    { id: 'BW-ORD-2023-4410', customer: 'Madrid Materials SA', date: 'Nov 11, 2023', amount: '€5,412.00', status: 'Delivered' },
    { id: 'BW-ORD-2023-4409', customer: 'Paris Build Corp', date: 'Nov 11, 2023', amount: '€1,890.50', status: 'Delivered' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">System Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="border-gray-200 rounded-[8px] font-bold">Export Report</Button>
            <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="rounded-[8px] border-none shadow-sm hover:shadow-md transition-shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-[8px] bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                    {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-extrabold text-brand-navy mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-brand-navy">Recent Orders</h2>
                <Button variant="ghost" className="text-brand-orange font-bold hover:underline">View All Orders</Button>
            </div>
            <Card className="rounded-[8px] border-none shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                        <tr>
                            <th className="px-8 py-4">Reference</th>
                            <th className="px-8 py-4">Customer</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 cursor-pointer group">
                                <td className="px-8 py-6 font-bold text-brand-navy group-hover:text-brand-orange transition-colors">{order.id}</td>
                                <td className="px-8 py-6 font-semibold text-gray-600">{order.customer}</td>
                                <td className="px-8 py-6">
                                    <Badge className={`border-none px-3 py-1 flex items-center gap-1 w-fit ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                        order.status === 'In Transit' ? 'bg-blue-100 text-blue-600' :
                                        'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {order.status === 'Delivered' ? <CheckCircle2 className="h-3 w-3" /> :
                                         order.status === 'In Transit' ? <ShoppingCart className="h-3 w-3" /> :
                                         <Clock className="h-3 w-3" />}
                                        {order.status}
                                    </Badge>
                                </td>
                                <td className="px-8 py-6 text-right font-extrabold text-brand-navy">{order.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>

        {/* Recent Lead Activity */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-navy">New Leads</h2>
            <Card className="rounded-[8px] border-none shadow-sm p-6 space-y-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 pb-6 border-b last:border-b-0 last:pb-0">
                        <div className="h-10 w-10 bg-brand-navy/5 rounded-[8px] flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-brand-navy" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-brand-navy truncate">Nordic Wood Supplies</p>
                            <p className="text-xs text-gray-400">Stockholm, Sweden • 2 mins ago</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                ))}
                <Button className="w-full bg-brand-navy hover:bg-blue-800 text-white rounded-[8px] font-bold h-12">
                    Review All Leads
                </Button>
            </Card>
        </div>
      </div>
    </div>
  );
}
