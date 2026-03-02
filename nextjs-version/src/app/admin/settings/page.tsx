import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Settings,
  ShieldCheck,
  Bell,
  Globe,
  Database,
  Lock,
  User,
  Mail,
  Save,
  RefreshCw,
  Eye,
  CreditCard,
  Truck
} from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">System Settings</h1>
          <p className="text-gray-500 mt-2">Manage global configurations, user roles, and system integrations.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="border-gray-200 rounded-[8px] font-bold h-12 px-6">
                <RefreshCw className="mr-2 h-5 w-5" />
                Discard Changes
            </Button>
            <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12 px-8">
                <Save className="mr-2 h-5 w-5" />
                Save Settings
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation Sidebar */}
        <Card className="rounded-[8px] border-none shadow-sm overflow-hidden h-fit">
            <nav className="flex flex-col">
                <Link className="flex items-center gap-4 px-6 py-4 bg-brand-navy text-white font-bold" href="#">
                    <ShieldCheck className="h-5 w-5" />
                    <span>General Admin</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="#">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="#">
                    <Globe className="h-5 w-5" />
                    <span>Regional Sourcing</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="#">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Gateways</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="#">
                    <Truck className="h-5 w-5" />
                    <span>Shipping Rules</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors border-b" href="#">
                    <Database className="h-5 w-5" />
                    <span>API Integrations</span>
                </Link>
                <Link className="flex items-center gap-4 px-6 py-4 text-red-600 hover:bg-red-50 transition-colors" href="#">
                    <Lock className="h-5 w-5" />
                    <span>Security Audit</span>
                </Link>
            </nav>
        </Card>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 space-y-8">
            <Card className="rounded-[8px] border-none shadow-sm">
                <CardHeader className="p-8 border-b">
                    <CardTitle className="text-2xl font-bold text-brand-navy">General Information</CardTitle>
                    <CardDescription>Configure basic system-wide information and administrative contact details.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700">Platform Name</label>
                            <Input className="rounded-[8px] bg-gray-50" defaultValue="Bewama Industrial Brokerage" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700">Support Email</label>
                            <Input className="rounded-[8px] bg-gray-50" defaultValue="admin-support@bewama.com" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700">Wholesale VAT Rate (%)</label>
                            <Input className="rounded-[8px] bg-gray-50" defaultValue="20.0" type="number" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700">Default Currency</label>
                            <select className="w-full p-2.5 border border-gray-200 rounded-[8px] bg-gray-50 focus:ring-2 focus:ring-brand-navy outline-none">
                                <option>EUR (€)</option>
                                <option>GBP (£)</option>
                                <option>USD ($)</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[8px] border-none shadow-sm">
                <CardHeader className="p-8 border-b">
                    <CardTitle className="text-2xl font-bold text-brand-navy">Wholesale Tier Settings</CardTitle>
                    <CardDescription>Define discount levels and minimum order requirements for tiered pricing.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-6">
                        {[1, 2, 3].map((tier) => (
                            <div key={tier} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[8px] bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-brand-navy text-white rounded-full flex items-center justify-center font-bold">{tier}</div>
                                    <div>
                                        <p className="font-bold text-brand-navy">Wholesale Tier {tier}</p>
                                        <p className="text-xs text-gray-400">Apply discounts to verified partners</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount</p>
                                        <Input className="w-20 rounded-[8px] h-8 text-center" defaultValue={`${tier * 5}%`} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min. Spend</p>
                                        <Input className="w-32 rounded-[8px] h-8 text-center" defaultValue={`€${tier * 5000}`} />
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-orange mt-4 md:mt-0"><Settings className="h-5 w-5" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 p-8 bg-white border border-dashed border-gray-200 rounded-[8px]">
                <p className="text-sm text-gray-500 italic">Last system-wide backup: Today at 04:00 AM UTC</p>
                <Button variant="outline" className="border-brand-navy text-brand-navy rounded-[8px] font-bold">Manual Backup Now</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
