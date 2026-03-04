import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, ShoppingCart, User, Settings, MessageSquare, LogOut, ChevronRight, Truck, Clock, CheckCircle2, Download, Search, Filter, ArrowLeft, Printer, Box } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function OrderDetailsPage() {
  const order = {
    id: 'BW-ORD-2023-4412',
    date: 'Nov 12, 2023',
    status: 'In Transit',
    tracking: 'TH982736451GB',
    carrier: 'DHL Freight',
    estDelivery: 'Nov 18, 2023',
    subtotal: '€2,700.00',
    shipping: '€0.00',
    vat: '€540.00',
    total: '€3,240.00',
    paymentMethod: 'Bank Transfer (Invoice #INV-4412)',
    shippingAddress: {
        company: 'Global Construct Ltd',
        street: '128 Industrial Way',
        city: 'London',
        postcode: 'E1 6AN',
        country: 'United Kingdom'
    },
    items: [
        { name: 'Premium MDF Board 18mm', sku: 'BW-TIM-MDF18-2412', quantity: 50, price: '€45.00', total: '€2,250.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsE8gZ4V4PPHEYSE7qCjJNoeFLSBiRnt3YfNDzd-QAk3VMv1m75VGcWtigh4E5aytAWmayB98ZPoF068oLY3B78Cs48m-Pbbnbsuohuf5JxfsSrUDy70PU7_yMKZGbFgfFPT8E-oJX8M6SbrL9KFFRDfXPGxwKNQXeQC2DjtiVz7JFjwNDQzouYxmSx1ze3wqmntOcHGtFir767ahdA-TiRKuGW-T_PxL2S0BFkAgn3cK6CrOGEc4lQ7b87NtXXYRMdh-v-x42Q-NC' },
        { name: 'Pro-Seal Adhesive 500ml', sku: 'BW-CHM-PSA500', quantity: 15, price: '€30.00', total: '€450.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCid193PAd9zWoNGZaJw-eQ4YAhSaAyxfJl_E7bWuOwpyLnv79PWlZRuRG20HzqspE1s3Vrv62fa1jH_Mu26W1kdtk1ejwR-cQw3tBcRc9aS3FiljjmyDOpIA449o7jOMcGzzwsn1QpPe4hRiU1LO27crgfBopSGKe_6cJdQ71pTe799bxtB9vJdzLsaz9Eoq3KT4w3v4JLLJqw3othFd_tnikNWK2ZEle1U__V1fz0omOgTWbwhZsbX6KIIiKhIs78UA4NDSZ7p7E0' }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Profile Navigation Sidebar (Shared) */}
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

        {/* Order Details Content */}
        <div className="lg:flex-1 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Link className="flex items-center gap-2 text-sm font-bold text-brand-orange hover:underline mb-4" href="/order-history">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Order History
                    </Link>
                    <h1 className="text-4xl font-extrabold text-brand-navy">Order Details</h1>
                    <p className="text-gray-500">Placed on {order.date} • Reference: <span className="text-brand-navy font-bold">{order.id}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="flex items-center gap-2 border-gray-300 rounded-[8px]">
                        <Printer className="h-4 w-4" />
                        <span>Print Invoice</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 border-gray-300 rounded-[8px]">
                        <Download className="h-4 w-4" />
                        <span>Download PDF</span>
                    </Button>
                </div>
            </div>

            {/* Tracking Status Card */}
            <Card className="rounded-[8px] border-2 border-brand-navy overflow-hidden">
                <div className="bg-brand-navy text-white p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20">
                                <Truck className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Current Status</p>
                                <h3 className="text-2xl font-bold">{order.status}</h3>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Estimated Delivery</p>
                            <h3 className="text-2xl font-bold">{order.estDelivery}</h3>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-12 relative">
                        <div className="h-2 bg-white/20 rounded-full w-full"></div>
                        <div className="h-2 bg-brand-orange rounded-full absolute top-0 left-0 w-3/4 shadow-[0_0_15px_rgba(255,102,0,0.5)]"></div>
                        <div className="flex justify-between mt-6 text-xs font-bold text-white/80">
                            <div className="text-brand-orange">ORDER PLACED<br/><span className="text-white/40">Nov 12</span></div>
                            <div className="text-brand-orange">PROCESSED<br/><span className="text-white/40">Nov 13</span></div>
                            <div className="text-brand-orange">SHIPPED<br/><span className="text-white/40">Nov 14</span></div>
                            <div className="opacity-40">DELIVERED<br/><span className="text-white/40">Expected Nov 18</span></div>
                        </div>
                    </div>
                </div>
                <CardContent className="p-8 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Shipping & Tracking</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Carrier:</span>
                                    <span className="font-bold text-brand-navy">{order.carrier}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tracking Number:</span>
                                    <span className="font-bold text-brand-orange hover:underline cursor-pointer">{order.tracking}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Shipping Address</p>
                            <div className="text-sm text-gray-600">
                                <p className="font-bold text-brand-navy">{order.shippingAddress.company}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postcode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items Table */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-brand-navy">Items Ordered</h2>
                <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-8 py-4">Product</th>
                                <th className="px-8 py-4 text-center">Quantity</th>
                                <th className="px-8 py-4 text-right">Price</th>
                                <th className="px-8 py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {order.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-gray-50 rounded-[8px] border flex items-center justify-center flex-shrink-0">
                                                <img alt={item.name} className="h-4/5 w-4/5 object-contain" src={item.image} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-brand-navy">{item.name}</p>
                                                <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center font-bold text-gray-600">{item.quantity} units</td>
                                    <td className="px-8 py-6 text-right font-semibold text-gray-600">{item.price}</td>
                                    <td className="px-8 py-6 text-right font-extrabold text-brand-navy">{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <Card className="rounded-[8px] border-gray-100 p-8 space-y-4">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Payment Information</p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-[8px]">
                            <Box className="h-8 w-8 text-brand-navy" />
                            <div>
                                <p className="font-bold text-brand-navy text-sm">{order.paymentMethod}</p>
                                <p className="text-xs text-green-600 font-bold">Transaction Confirmed</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white rounded-[8px] font-bold">
                            View Receipt
                        </Button>
                    </div>
                </Card>

                <div className="bg-white rounded-[8px] border border-gray-200 p-8 space-y-4">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Summary</p>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-bold text-brand-navy">{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Shipping</span>
                            <span className="text-green-600 font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between text-sm pb-4 border-b">
                            <span className="text-gray-500">VAT (20%)</span>
                            <span className="font-bold text-brand-navy">{order.vat}</span>
                        </div>
                        <div className="flex justify-between text-2xl pt-2">
                            <span className="font-extrabold text-brand-navy">Total Amount</span>
                            <span className="font-extrabold text-brand-orange">{order.total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
