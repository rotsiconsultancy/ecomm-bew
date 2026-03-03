import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Copy, FileText, Send, ArrowRight } from 'lucide-react';

export default function QuoteSubmittedPage() {
  const quoteRef = 'BW-Q-2023-8842';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="bg-green-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <div className="space-y-6">
        <h1 className="text-5xl font-extrabold text-brand-navy tracking-tight">Quote Request Received!</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Thank you for choosing Bewama. Our industrial material specialists are reviewing your requirements and will get back to you with a competitive quote shortly.
        </p>
      </div>

      <div className="mt-12 bg-white p-8 rounded-[8px] border-2 border-brand-navy shadow-xl max-w-lg mx-auto overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText className="h-24 w-24 text-brand-navy" />
        </div>
        <div className="space-y-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Reference Number</p>
            <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-extrabold text-brand-navy">{quoteRef}</span>
                <Button variant="ghost" size="icon" className="hover:text-brand-orange">
                    <Copy className="h-5 w-5" />
                </Button>
            </div>
            <p className="text-xs text-gray-400">Please quote this reference for any future inquiries.</p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="space-y-3">
            <div className="h-10 w-10 bg-brand-navy rounded-full flex items-center justify-center text-white font-bold">1</div>
            <h4 className="font-bold text-brand-navy">Reviewing Request</h4>
            <p className="text-sm text-gray-500">Our team evaluates product availability and wholesale pricing based on your volume.</p>
        </div>
        <div className="space-y-3">
            <div className="h-10 w-10 bg-brand-navy rounded-full flex items-center justify-center text-white font-bold">2</div>
            <h4 className="font-bold text-brand-navy">Finalizing Quote</h4>
            <p className="text-sm text-gray-500">We calculate the most efficient logistics and shipping options for your location.</p>
        </div>
        <div className="space-y-3">
            <div className="h-10 w-10 bg-brand-navy rounded-full flex items-center justify-center text-white font-bold">3</div>
            <h4 className="font-bold text-brand-navy">Direct Contact</h4>
            <p className="text-sm text-gray-500">An account manager will email you the finalized proposal within 24 hours.</p>
        </div>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
        <Button asChild className="px-10 h-14 bg-brand-navy hover:bg-blue-800 text-white rounded-[8px] font-extrabold text-lg shadow-lg active:scale-95 transition-all">
          <Link href="/products">Continue Exploring Catalog</Link>
        </Button>
        <Button variant="outline" asChild className="px-10 h-14 border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white rounded-[8px] font-extrabold text-lg transition-all">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <div className="mt-12 text-gray-400 text-sm flex items-center justify-center gap-2">
        <Send className="h-4 w-4" />
        <span>A copy of your request has been sent to your business email.</span>
      </div>
    </div>
  );
}
