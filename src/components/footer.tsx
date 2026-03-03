import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <span className="text-2xl font-extrabold tracking-tight">BEWAMA</span>
            <p className="text-gray-400 text-sm">Providing top-tier industrial materials and brokerage services for global businesses since 2005.</p>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Quick Links</h5>
            <ul className="space-y-2 text-gray-400">
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">About Us</Link></li>
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">Product Catalog</Link></li>
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">Wholesale Portal</Link></li>
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Customer Support</h5>
            <ul className="space-y-2 text-gray-400">
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">Shipping Policy</Link></li>
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">Returns & Refunds</Link></li>
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">Quality Assurance</Link></li>
              <li><Link className="hover:text-brand-orange transition-colors" href="/products">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Contact Info</h5>
            <div className="space-y-2 text-gray-400">
              <p>Email: sales@bewama.com</p>
              <p>Phone: +44 20 7946 0958</p>
              <p>Address: 128 Industrial Way, London, UK</p>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          <p>© 2023 Bewama Industrial Brokerage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
