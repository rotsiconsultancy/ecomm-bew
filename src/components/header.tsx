import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="text-3xl font-extrabold text-brand-navy tracking-tight">
            BEWAMA
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search industrial products, SKU, or categories..."
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-brand-navy focus:border-brand-navy transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link href="/login" className="hidden lg:block text-brand-navy font-semibold hover:text-blue-800 transition-colors">
            Log In
          </Link>
          <Button asChild className="bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-2.5 rounded-[8px] font-bold transition-all shadow-sm active:scale-95">
            <Link href="/request-quote">
              Request Quote
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
