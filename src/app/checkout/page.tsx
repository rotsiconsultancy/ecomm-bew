import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, ShieldCheck, Truck, Lock, Plus, Minus } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Checkout Section */}
        <div className="lg:flex-1 space-y-12">
          <div className="flex items-center gap-4 border-b pb-4">
            <h1 className="text-4xl font-extrabold text-brand-navy">Wholesale Checkout</h1>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                <span className="font-bold text-brand-orange">1. Details</span>
                <span>/</span>
                <span>2. Payment</span>
                <span>/</span>
                <span>3. Complete</span>
            </div>
          </div>

          <form className="space-y-12">
            {/* Step 1: Business Details */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="bg-brand-navy text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">1</span>
                    <h2 className="text-2xl font-bold text-brand-navy">Business Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Company Name</label>
                        <Input className="rounded-[8px]" placeholder="Global Construct Ltd" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">VAT Number</label>
                        <Input className="rounded-[8px]" placeholder="GB123456789" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Business Email</label>
                        <Input className="rounded-[8px]" placeholder="purchasing@company.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Phone Number</label>
                        <Input className="rounded-[8px]" placeholder="+44 20 7946 0958" />
                    </div>
                </div>
            </div>

            {/* Step 2: Delivery Details */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="bg-brand-navy text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">2</span>
                    <h2 className="text-2xl font-bold text-brand-navy">Delivery Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-700">Street Address</label>
                        <Input className="rounded-[8px]" placeholder="128 Industrial Way" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">City</label>
                        <Input className="rounded-[8px]" placeholder="London" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Postcode</label>
                        <Input className="rounded-[8px]" placeholder="E1 6AN" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-700">Delivery Instructions (Optional)</label>
                        <textarea className="w-full p-3 border border-gray-300 rounded-[8px] min-h-[100px] focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none transition-all" placeholder="Enter delivery access codes or contact person details..."></textarea>
                    </div>
                </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="bg-brand-navy text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">3</span>
                    <h2 className="text-2xl font-bold text-brand-navy">Payment Method</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative border-2 border-brand-orange bg-brand-orange/5 p-4 rounded-[8px] cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-brand-navy">Bank Transfer</span>
                            <div className="h-5 w-5 rounded-full border-4 border-brand-orange bg-white"></div>
                        </div>
                        <p className="text-xs text-gray-500">Invoice payable within 30 days (Existing Clients Only)</p>
                    </div>
                    <div className="relative border border-gray-200 p-4 rounded-[8px] cursor-pointer hover:border-brand-navy transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-brand-navy">Credit Card</span>
                            <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                        </div>
                        <p className="text-xs text-gray-500">Visa, Mastercard, Amex. Secured by Stripe.</p>
                    </div>
                    <div className="relative border border-gray-200 p-4 rounded-[8px] cursor-pointer hover:border-brand-navy transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-brand-navy">PayPal</span>
                            <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                        </div>
                        <p className="text-xs text-gray-500">Fast and secure checkout using your PayPal account.</p>
                    </div>
                </div>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="w-full lg:w-96">
            <div className="sticky top-24 space-y-8">
                <Card className="rounded-[8px] shadow-lg border-2 border-brand-navy overflow-hidden">
                    <div className="bg-brand-navy text-white p-6">
                        <h3 className="text-xl font-bold">Order Summary</h3>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* Product Item 1 */}
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-gray-50 rounded-[8px] border flex items-center justify-center flex-shrink-0">
                                    <img alt="MDF" className="h-4/5 w-4/5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsE8gZ4V4PPHEYSE7qCjJNoeFLSBiRnt3YfNDzd-QAk3VMv1m75VGcWtigh4E5aytAWmayB98ZPoF068oLY3B78Cs48m-Pbbnbsuohuf5JxfsSrUDy70PU7_yMKZGbFgfFPT8E-oJX8M6SbrL9KFFRDfXPGxwKNQXeQC2DjtiVz7JFjwNDQzouYxmSx1ze3wqmntOcHGtFir767ahdA-TiRKuGW-T_PxL2S0BFkAgn3cK6CrOGEc4lQ7b87NtXXYRMdh-v-x42Q-NC" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-brand-navy text-sm truncate">Premium MDF Board 18mm</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center border rounded-[8px] scale-75 -ml-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                                            <span className="px-3 text-xs font-bold">50</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                                        </div>
                                        <span className="font-bold text-brand-navy">€2,275.00</span>
                                    </div>
                                </div>
                            </div>
                            {/* Product Item 2 */}
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-gray-50 rounded-[8px] border flex items-center justify-center flex-shrink-0">
                                    <img alt="Adhesive" className="h-4/5 w-4/5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCid193PAd9zWoNGZaJw-eQ4YAhSaAyxfJl_E7bWuOwpyLnv79PWlZRuRG20HzqspE1s3Vrv62fa1jH_Mu26W1kdtk1ejwR-cQw3tBcRc9aS3FiljjmyDOpIA449o7jOMcGzzwsn1QpPe4hRiU1LO27crgfBopSGKe_6cJdQ71pTe799bxtB9vJdzLsaz9Eoq3KT4w3v4JLLJqw3othFd_tnikNWK2ZEle1U__V1fz0omOgTWbwhZsbX6KIIiKhIs78UA4NDSZ7p7E0" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-brand-navy text-sm truncate">Pro-Seal Adhesive 500ml</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center border rounded-[8px] scale-75 -ml-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                                            <span className="px-3 text-xs font-bold">120</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                                        </div>
                                        <span className="font-bold text-brand-navy">€3,598.80</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-bold text-brand-navy">€5,873.80</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-green-600 font-bold">FREE</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">VAT (20%)</span>
                                <span className="font-bold text-brand-navy">€1,174.76</span>
                            </div>
                            <div className="flex justify-between text-xl pt-4">
                                <span className="font-extrabold text-brand-navy">Total</span>
                                <span className="font-extrabold text-brand-orange">€7,048.56</span>
                            </div>
                        </div>

                        <Button className="w-full h-14 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-extrabold text-lg shadow-lg active:scale-95 transition-all">
                            Complete Order
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4">
                            <Lock className="h-3 w-3" />
                            <span>SSL Secured Checkout</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white p-6 rounded-[8px] border border-gray-200 space-y-4">
                    <div className="flex items-center gap-3">
                        <Truck className="h-6 w-6 text-brand-navy" />
                        <div>
                            <p className="font-bold text-brand-navy text-sm">Priority Delivery</p>
                            <p className="text-xs text-gray-500">Est. Arrival: Nov 24-26</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-brand-navy" />
                        <div>
                            <p className="font-bold text-brand-navy text-sm">Trade Assurance</p>
                            <p className="text-xs text-gray-500">100% Quality Protected</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
