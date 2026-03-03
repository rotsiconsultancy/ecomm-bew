import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Send, FileText, CheckCircle2 } from 'lucide-react';

export default function RequestQuotePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Quote Form */}
        <div className="lg:flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-brand-navy mb-4">Request a Bulk Quote</h1>
            <p className="text-gray-500 max-w-2xl text-lg">
              Get personalized pricing for large orders or custom industrial material requirements.
              Our team responds within 24 hours on business days.
            </p>
          </div>

          <Card className="rounded-[8px] border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-brand-navy/5 p-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-brand-navy" />
                    <h3 className="text-xl font-bold text-brand-navy">Project Information</h3>
                </div>
            </div>
            <CardContent className="p-8">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700">Company Name</label>
                        <Input className="rounded-[8px]" placeholder="Global Construct Ltd" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700">Business Email</label>
                        <Input className="rounded-[8px]" placeholder="purchasing@company.com" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700">Phone Number</label>
                        <Input className="rounded-[8px]" placeholder="+44 20 7946 0958" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700">Preferred Timeline</label>
                        <select className="w-full p-3 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none bg-white transition-all">
                            <option>Immediate (within 1 week)</option>
                            <option>Near Future (1-4 weeks)</option>
                            <option>Long Term (1 month+)</option>
                        </select>
                    </div>

                    {/* Requirement Details */}
                    <div className="md:col-span-2 space-y-4">
                        <label className="text-sm font-bold text-gray-700">Tell us what you need (SKU, Quantities, Specs)</label>
                        <textarea className="w-full p-4 border border-gray-300 rounded-[8px] min-h-[150px] focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none transition-all" placeholder="E.g. We require 250 units of Pro-Seal Adhesive 500ml and 100 sheets of 18mm MDF board..."></textarea>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <label className="text-sm font-bold text-gray-700">Attach Technical Specifications (Optional)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-[8px] p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
                            <p className="text-sm text-gray-500 mb-2 font-semibold">Drop files here or click to upload</p>
                            <p className="text-xs text-gray-400">PDF, XLS, JPG (Max 10MB)</p>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <Button className="w-full md:w-auto px-12 h-14 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-extrabold text-lg shadow-lg active:scale-95 transition-all">
                            Submit Quote Request
                        </Button>
                        <p className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Your data is securely stored and processed according to our Privacy Policy.
                        </p>
                    </div>
                </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <aside className="w-full lg:w-96 space-y-8">
            <div className="bg-brand-navy text-white p-8 rounded-[8px] shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Why Choose Bewama?</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Badge className="bg-brand-orange">01</Badge>
                        </div>
                        <div>
                            <p className="font-bold">Competitive Wholesale Rates</p>
                            <p className="text-sm text-gray-300 mt-1">Direct from manufacturer pricing for bulk orders.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Badge className="bg-brand-orange">02</Badge>
                        </div>
                        <div>
                            <p className="font-bold">Global Logistics Support</p>
                            <p className="text-sm text-gray-300 mt-1">Managing shipping, customs, and delivery door-to-door.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Badge className="bg-brand-orange">03</Badge>
                        </div>
                        <div>
                            <p className="font-bold">Dedicated Account Manager</p>
                            <p className="text-sm text-gray-300 mt-1">One point of contact for all your industrial needs.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[8px] border border-gray-200 shadow-sm">
                <h4 className="text-xl font-bold text-brand-navy mb-6">Direct Contact</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-600">
                        <Phone className="h-5 w-5 text-brand-orange" />
                        <span>+44 20 7946 0958</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                        <Mail className="h-5 w-5 text-brand-orange" />
                        <span>sales@bewama.com</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                        <MapPin className="h-5 w-5 text-brand-orange" />
                        <span>128 Industrial Way, London, UK</span>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t">
                    <p className="text-sm text-gray-500 mb-4">Urgent enquiry?</p>
                    <Button variant="outline" className="w-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white rounded-[8px] font-bold">
                        Speak to Sales Now
                    </Button>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
