import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, ShieldCheck, Truck, RefreshCw, Minus, Plus } from 'lucide-react';

export default function IndividualListingPage() {
  const product = {
    id: 1,
    title: 'Premium MDF Board 18mm (2440 x 1220mm)',
    category: 'Timber & Boards',
    price: '45.50',
    originalPrice: '52.00',
    sku: 'BW-TIM-MDF18-2412',
    stock: 'In Stock (450+ Units)',
    rating: 4.8,
    reviews: 124,
    description: 'Our premium Medium Density Fibreboard (MDF) is engineered for excellence, featuring a smooth, sanded surface and a consistent density profile. Ideal for high-quality cabinetry, furniture manufacturing, and architectural mouldings.',
    specs: [
      { name: 'Dimensions', value: '2440mm x 1220mm' },
      { name: 'Thickness', value: '18mm' },
      { name: 'Grade', value: 'EN622-5 (Standard)' },
      { name: 'Emission', value: 'Formaldehyde Class E1' },
      { name: 'Moisture', value: 'Resistance Standard' },
    ],
    images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAsE8gZ4V4PPHEYSE7qCjJNoeFLSBiRnt3YfNDzd-QAk3VMv1m75VGcWtigh4E5aytAWmayB98ZPoF068oLY3B78Cs48m-Pbbnbsuohuf5JxfsSrUDy70PU7_yMKZGbFgfFPT8E-oJX8M6SbrL9KFFRDfXPGxwKNQXeQC2DjtiVz7JFjwNDQzouYxmSx1ze3wqmntOcHGtFir767ahdA-TiRKuGW-T_PxL2S0BFkAgn3cK6CrOGEc4lQ7b87NtXXYRMdh-v-x42Q-NC',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBIR0i1TUi9x4VneDk2A5LWpVl5VarrpO8sAPEk_DX8Z7gyAaOgzym9eyvzgWHwaPsuii3e9KgisZeMos3ycsjdhigta5hNpE08lhoMEl_MJ9mOEkuowTa8FwSr2WFu4SjAjx0fKgJKCByP0nvScDIPH5sEeBYFrnOrKu0Br9r1PWcpC55MeAHWYEKrgK3uHtJwl5d52_gnw_8n2LzR43GN0GzSCU4UuU_mPNGGRPQB73KoSVwhj3MWdZzS3uE0fS1E4NXsRXveKPMa'
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-8 space-x-2">
        <Link className="hover:text-brand-orange" href="/">Home</Link>
        <span>/</span>
        <Link className="hover:text-brand-orange" href="/products">Products</Link>
        <span>/</span>
        <Link className="hover:text-brand-orange" href="/products">Timber & Boards</Link>
        <span>/</span>
        <span className="text-brand-navy font-semibold truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden aspect-square flex items-center justify-center p-8">
            <img alt={product.title} className="max-w-full max-h-full object-contain" src={product.images[0]} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.concat([product.images[0], product.images[1]]).map((img, i) => (
              <div key={i} className={`bg-white rounded-[8px] border overflow-hidden aspect-square flex items-center justify-center p-2 cursor-pointer transition-all ${i === 0 ? 'border-brand-orange ring-1 ring-brand-orange' : 'border-gray-200 hover:border-brand-navy'}`}>
                <img alt={`Thumb ${i}`} className="max-w-full max-h-full object-contain" src={img} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <Badge className="bg-brand-orange mb-4">Best Seller</Badge>
            <h1 className="text-4xl font-extrabold text-brand-navy mb-4 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 fill-current ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-gray-700 font-semibold">{product.rating}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{product.reviews} Customer Reviews</span>
              <span className="text-gray-400">|</span>
              <span className="text-green-600 font-bold">{product.stock}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-[8px] border border-gray-100">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-4xl font-extrabold text-brand-navy">€{product.price}</span>
              <span className="text-xl text-gray-400 line-through">€{product.originalPrice}</span>
              <Badge variant="outline" className="text-brand-orange border-brand-orange">Save 12%</Badge>
            </div>
            <p className="text-sm text-gray-500">Excluding VAT & Shipping costs</p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {product.specs.map((spec) => (
                <div key={spec.name}>
                  <span className="font-bold text-brand-navy">{spec.name}:</span>
                  <span className="ml-2 text-gray-600">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center border border-gray-300 rounded-[8px] bg-white">
                <Button variant="ghost" className="px-4 py-2 hover:bg-gray-100 rounded-l-[8px]"><Minus className="h-4 w-4" /></Button>
                <span className="px-6 font-bold text-brand-navy">1</span>
                <Button variant="ghost" className="px-4 py-2 hover:bg-gray-100 rounded-r-[8px]"><Plus className="h-4 w-4" /></Button>
              </div>
              <Button className="flex-1 bg-brand-navy hover:bg-blue-800 text-white h-12 rounded-[8px] font-bold text-lg transition-all active:scale-95 shadow-lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Wholesale Order
              </Button>
            </div>
            <Button variant="outline" className="w-full h-12 border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-bold rounded-[8px] transition-all">
              Request Bulk Quote
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="text-center space-y-2">
                <ShieldCheck className="mx-auto h-8 w-8 text-brand-orange" />
                <p className="text-xs font-bold text-brand-navy">Quality Assured</p>
            </div>
            <div className="text-center space-y-2">
                <Truck className="mx-auto h-8 w-8 text-brand-orange" />
                <p className="text-xs font-bold text-brand-navy">Fast Delivery</p>
            </div>
            <div className="text-center space-y-2">
                <RefreshCw className="mx-auto h-8 w-8 text-brand-orange" />
                <p className="text-xs font-bold text-brand-navy">30-Day Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
