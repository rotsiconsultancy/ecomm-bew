import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, ShoppingCart, User, Settings, Package, MessageSquare, LogOut, ChevronRight, Truck, Clock, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Profile Navigation Sidebar */}
        <aside className="w-full lg:w-80 space-y-8">
            <div className="bg-white p-8 rounded-[8px] border border-gray-200 shadow-sm text-center">
                <div className="h-24 w-24 bg-brand-navy/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand-navy">
                    <User className="h-12 w-12 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy">Global Construct Ltd</h3>
                <p className="text-sm text-gray-400">Premium Wholesale Partner</p>
                <Badge className="mt-4 bg-brand-orange">Verified Account</Badge>
            </div>

            <nav className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
                <Link className="flex items-center gap-4 px-6 py-4 bg-brand-navy text-white font-bold" href="/profile">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Account Overview</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="/order-history">
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

        {/* Profile Content */}
        <div className="lg:flex-1 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-extrabold text-brand-navy">Account Overview</h1>
                <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold">Edit Profile</Button>
            </div>

            {/* Account Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[8px] border-gray-100 shadow-sm p-6 space-y-2">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                    <p className="text-3xl font-extrabold text-brand-navy">€14,890.50</p>
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        12 successful orders
                    </p>
                </Card>
                <Card className="rounded-[8px] border-gray-100 shadow-sm p-6 space-y-2">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Quotes</p>
                    <p className="text-3xl font-extrabold text-brand-navy">2</p>
                    <p className="text-xs text-brand-orange font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Awaiting review
                    </p>
                </Card>
                <Card className="rounded-[8px] border-gray-100 shadow-sm p-6 space-y-2">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Wholesale Tier</p>
                    <p className="text-3xl font-extrabold text-brand-navy">Tier 2</p>
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Next tier at €25k
                    </p>
                </Card>
            </div>

            {/* Recent Orders Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-brand-navy">Recent Activity</h2>
                    <Link className="text-sm font-bold text-brand-orange hover:underline" href="/order-history">View All Activity &rarr;</Link>
                </div>

                <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-8 py-4">Reference</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Date</th>
                                <th className="px-8 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            <tr className="hover:bg-gray-50/50 cursor-pointer group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-brand-navy/5 rounded-[8px] flex items-center justify-center">
                                            <ShoppingCart className="h-4 w-4 text-brand-navy" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">BW-ORD-2023-4412</p>
                                            <p className="text-xs text-gray-400">Order</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 border-none px-3 py-1 flex items-center gap-1 w-fit">
                                        <Truck className="h-3 w-3" />
                                        In Transit
                                    </Badge>
                                </td>
                                <td className="px-8 py-6 font-semibold text-gray-600">Nov 12, 2023</td>
                                <td className="px-8 py-6 text-right font-extrabold text-brand-navy">€3,240.00</td>
                            </tr>
                            <tr className="hover:bg-gray-50/50 cursor-pointer group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-brand-navy/5 rounded-[8px] flex items-center justify-center">
                                            <MessageSquare className="h-4 w-4 text-brand-navy" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">BW-Q-2023-8842</p>
                                            <p className="text-xs text-gray-400">Quote Request</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border-none px-3 py-1 flex items-center gap-1 w-fit">
                                        <Clock className="h-3 w-3" />
                                        Pending
                                    </Badge>
                                </td>
                                <td className="px-8 py-6 font-semibold text-gray-600">Nov 10, 2023</td>
                                <td className="px-8 py-6 text-right font-extrabold text-brand-navy">--</td>
                            </tr>
                            <tr className="hover:bg-gray-50/50 cursor-pointer group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-brand-navy/5 rounded-[8px] flex items-center justify-center">
                                            <ShoppingCart className="h-4 w-4 text-brand-navy" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">BW-ORD-2023-3982</p>
                                            <p className="text-xs text-gray-400">Order</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <Badge className="bg-green-100 text-green-600 hover:bg-green-200 border-none px-3 py-1 flex items-center gap-1 w-fit">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Delivered
                                    </Badge>
                                </td>
                                <td className="px-8 py-6 font-semibold text-gray-600">Oct 28, 2023</td>
                                <td className="px-8 py-6 text-right font-extrabold text-brand-navy">€1,890.50</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
