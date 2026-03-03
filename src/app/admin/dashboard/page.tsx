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
    CalendarDays,
    Plus,
    Truck,
    AlertTriangle,
    Hammer,
    Search,
    ChevronRight,
    MoreVertical,
    Activity,
    Zap,
    Box,
    ClipboardList,
    BarChart3,
    DollarSign,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
    const stats = [
        { title: 'Total Sales (KES)', value: '1,250,000', change: '+5.2%', icon: DollarSign, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', trend: 'up' },
        { title: 'Pending Quotes', value: '48', change: '12 New', icon: ClipboardList, color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600', trend: 'neutral' },
        { title: 'New Orders', value: '156', change: '+12%', icon: Truck, color: 'bg-green-50 dark:bg-green-900/20 text-green-600', trend: 'up' },
        { title: 'Low Stock Alerts', value: '5 Items', change: '-3.5%', icon: AlertTriangle, color: 'bg-red-50 dark:bg-red-900/20 text-red-600', trend: 'down' },
    ];

    const recentOrders = [
        { id: '#ORD-7721', customer: 'John Kamau', status: 'Processing', amount: 'KES 45,000', statusColor: 'bg-blue-100 text-blue-600' },
        { id: '#ORD-7720', customer: 'Sarah Chen', status: 'Completed', amount: 'KES 12,500', statusColor: 'bg-green-100 text-green-600' },
        { id: '#ORD-7719', customer: 'Mike Omollo', status: 'Pending', amount: 'KES 89,000', statusColor: 'bg-orange-100 text-orange-600' },
        { id: '#ORD-7718', customer: 'Industrial Corp', status: 'Shipped', amount: 'KES 156,000', statusColor: 'bg-indigo-100 text-indigo-600' },
    ];

    const pendingQuotes = [
        { customer: 'Coastal Mining Ltd', subject: '24x Industrial Drill Bit Set', priority: 'HIGH PRIORITY', time: '2h ago', priorityColor: 'text-primary bg-primary/10' },
        { customer: 'Nairobi Dev Co', subject: '100m Armoured Power Cable', priority: 'BULK', time: '5h ago', priorityColor: 'text-slate-500 bg-slate-200 dark:bg-slate-800' },
        { customer: 'Greenway Farms', subject: '5x Submersible Water Pumps', priority: 'STANDARD', time: '8h ago', priorityColor: 'text-slate-500 bg-slate-200 dark:bg-slate-800' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Dashboard Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Welcome back, here&apos;s what&apos;s happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Oct 24 - Oct 31
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all px-6">
                        <Plus className="w-4 h-4" />
                        Create Quote
                    </Button>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold flex items-center px-2 py-1 rounded-full",
                                stat.trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' :
                                    stat.trend === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' :
                                        'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                            )}>
                                {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                                {stat.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-tight uppercase">{stat.title}</p>
                        <h3 className="text-3xl font-extrabold text-secondary dark:text-slate-100 mt-1">{stat.value}</h3>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden border-none">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-secondary dark:text-slate-100">Recent Orders</h3>
                            <Button variant="ghost" className="text-primary text-sm font-bold hover:underline p-0">View All</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-semibold text-secondary dark:text-slate-200">{order.id}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{order.customer}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={cn("px-3 py-1 text-[10px] font-bold rounded-full border-none", order.statusColor)}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-secondary dark:text-slate-100">{order.amount}</td>
                                            <td className="px-6 py-4">
                                                <Button variant="outline" size="sm" className="bg-slate-50 dark:bg-slate-700 text-secondary dark:text-slate-100 text-xs font-bold rounded-lg border-none hover:bg-slate-200 group-hover:bg-primary group-hover:text-white transition-all h-8">
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="font-bold text-secondary dark:text-slate-100 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Stock Utilization
                            </h4>
                            <div className="space-y-5">
                                {[
                                    { label: 'Industrial Pumps', value: 85, color: 'bg-primary' },
                                    { label: 'Copper Wiring', value: 32, color: 'bg-orange-400' }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                            <span>{item.label}</span>
                                            <span>{item.value}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-secondary p-6 rounded-2xl text-white relative overflow-hidden group border-none shadow-lg">
                            <div className="relative z-10">
                                <div className="bg-white/10 w-fit p-2 rounded-lg mb-3">
                                    <Zap className="w-5 h-5 text-primary" />
                                </div>
                                <h4 className="font-bold mb-2 text-lg">Inventory Upgrade</h4>
                                <p className="text-xs text-slate-300 mb-4 leading-relaxed font-medium">System upgrade scheduled for 02:00 AM. Please ensure all quotes are saved.</p>
                                <Button className="text-xs font-bold py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border-none">
                                    Learn More
                                </Button>
                            </div>
                            <Hammer className="absolute -bottom-8 -right-8 text-[120px] text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                        </Card>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="space-y-6">
                    <Card className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-none">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-lg text-secondary dark:text-slate-100">Pending Bulk Quotes</h3>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Action Required</p>
                        </div>
                        <div className="p-4 space-y-4">
                            {pendingQuotes.map((quote, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-sm text-secondary dark:text-slate-100 group-hover:text-primary transition-colors">{quote.customer}</p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{quote.subject}</p>
                                        </div>
                                        <Badge className={cn("text-[8px] font-black px-2 py-0.5 rounded border-none", quote.priorityColor)}>
                                            {quote.priority}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{quote.time}</span>
                                        </div>
                                        <Button size="sm" className="h-7 px-3 bg-primary text-white text-[10px] font-black rounded-lg hover:shadow-lg transition-all border-none">
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button className="text-[10px] font-black text-secondary dark:text-slate-300 hover:text-primary transition-colors uppercase tracking-widest">
                                View All Pending Quotes (12)
                            </button>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden border-none shadow-sm">
                        <h3 className="font-bold text-secondary dark:text-slate-100 mb-4 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Quick Shortcuts
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Plus, label: 'New Item', bg: 'hover:bg-blue-50 hover:text-blue-600' },
                                { icon: ClipboardList, label: 'Audit Logs', bg: 'hover:bg-orange-50 hover:text-orange-600' },
                                { icon: Briefcase, label: 'Shipping', bg: 'hover:bg-purple-50 hover:text-purple-600' },
                                { icon: BarChart3, label: 'Reports', bg: 'hover:bg-green-50 hover:text-green-600' }
                            ].map((item, i) => (
                                <button key={i} className={cn(
                                    "flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl transition-all group border border-transparent hover:border-current/20 hover:shadow-sm",
                                    item.bg
                                )}>
                                    <item.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
