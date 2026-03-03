import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Search } from 'lucide-react';

export default function ProductListingPage() {
  const products = [
    { id: 1, title: 'Pro-Seal Adhesive 500ml', category: 'Chemical & Sealants', price: '29.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCid193PAd9zWoNGZaJw-eQ4YAhSaAyxfJl_E7bWuOwpyLnv79PWlZRuRG20HzqspE1s3Vrv62fa1jH_Mu26W1kdtk1ejwR-cQw3tBcRc9aS3FiljjmyDOpIA449o7jOMcGzzwsn1QpPe4hRiU1LO27crgfBopSGKe_6cJdQ71pTe799bxtB9vJdzLsaz9Eoq3KT4w3v4JLLJqw3othFd_tnikNWK2ZEle1U__V1fz0omOgTWbwhZsbX6KIIiKhIs78UA4NDSZ7p7E0' },
    { id: 2, title: 'Premium MDF Board 18mm', category: 'Timber & Boards', price: '45.50', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsE8gZ4V4PPHEYSE7qCjJNoeFLSBiRnt3YfNDzd-QAk3VMv1m75VGcWtigh4E5aytAWmayB98ZPoF068oLY3B78Cs48m-Pbbnbsuohuf5JxfsSrUDy70PU7_yMKZGbFgfFPT8E-oJX8M6SbrL9KFFRDfXPGxwKNQXeQC2DjtiVz7JFjwNDQzouYxmSx1ze3wqmntOcHGtFir767ahdA-TiRKuGW-T_PxL2S0BFkAgn3cK6CrOGEc4lQ7b87NtXXYRMdh-v-x42Q-NC' },
    { id: 3, title: 'Industrial Drill Bit Set (12pc)', category: 'Professional Tools', price: '89.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVeCBW0GJckaeJnpjc-ZC1LbFY1DGGWqDqDUjycKNHZGQBaMZk9PuaRcTCnVg3V3_74AID-YaACf4fEy0MHzVXWUK0OCxGvyTP7IGNA-_zA8En4Hqc4dXLgr1hIeHLTvk0-1MzKqxW2X_0l_xdhmBDBa3YIUJb7w9vI2qzuss64lVyEEb4KyMA7WJfy9NjPu5VLZRFrTAwJvPl6KC6rAAqxsfbAIgNMYj4SqTAo4Lc88J1MY2Tbbxm67NrfFhiZXbcHvitBf9y429q' },
    { id: 4, title: 'C24 Treated Timber 4.8m', category: 'Timber & Construction', price: '12.95', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIR0i1TUi9x4VneDk2A5LWpVl5VarrpO8sAPEk_DX8Z7gyAaOgzym9eyvzgWHwaPsuii3e9KgisZeMos3ycsjdhigta5hNpE08lhoMEl_MJ9mOEkuowTa8FwSr2WFu4SjAjx0fKgJKCByP0nvScDIPH5sEeBYFrnOrKu0Br9r1PWcpC55MeAHWYEKrgK3uHtJwl5d52_gnw_8n2LzR43GN0GzSCU4UuU_mPNGGRPQB73KoSVwhj3MWdZzS3uE0fS1E4NXsRXveKPMa' },
    { id: 5, title: 'Structural Steel Beam', category: 'Metals & Construction', price: '215.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRP3Wq9G1cgCmFsfxnYrpIWanIV-1QpyQgxWp_V6L9vTPhSICNedPGgDr2ssfEepI5t1My3GGv0Afgi2Q1eyG_S-Cj85IKKy8gRzabizfM03akbfIPBoIpMpZwth0AiRBIqN_A5GSJfC8DasJlR29ouaAOEE7OVNf6aQL_GcHSZfHCjrws8BHaxaKvC3KB_4dVhbXbvWSZYP37AWrQpY_R-72yUgZwnFD1pzc5gzlKK2ZxMAaJ6nGZYzJgsvZDZB9cJ2jZKhnw6Kvp' },
    { id: 6, title: 'Heavy Duty Caster Wheels', category: 'Hardware', price: '14.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHBV2Qk3-Wmw5dN4v0kEF1dZtKYhmt5EXmCaVyr32KTEYllmkCzgbL6ZaB9Mveadt8dTOQVl4TO2GPc5H3Yjn0DPtzQOyRuTAZGwHMdXtMgLSy2UnX0-lQVp7bHp6ZmQ2apl4B8ukBqakZMoeM0-uKSR97E_NdbK3xEBB09KCmPZWEtAWYBWiBpPPR6me2_j-e2OTOdr1TGF0cCsIMZbAnEClzOU2N9ZIJwjQAh7he-VIgRO2l1WW8MGch9n4WOvdtvld3ExppBZDf' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy mb-2">Product Catalog</h1>
          <p className="text-gray-500">Discover quality materials for your industrial needs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Input className="pl-10 pr-4 py-2 border border-gray-300 rounded-[8px] w-64" placeholder="Search products..." type="text" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <Button variant="outline" className="flex items-center gap-2 border-gray-300 rounded-[8px]">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h3 className="text-lg font-bold text-brand-navy mb-4">Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600 hover:text-brand-orange cursor-pointer">
                <span>Chemicals & Sealants</span>
                <Badge variant="secondary">24</Badge>
              </div>
              <div className="flex items-center justify-between text-gray-600 hover:text-brand-orange cursor-pointer font-semibold text-brand-orange">
                <span>Timber & Boards</span>
                <Badge className="bg-brand-orange">18</Badge>
              </div>
              <div className="flex items-center justify-between text-gray-600 hover:text-brand-orange cursor-pointer">
                <span>Metals & Construction</span>
                <Badge variant="secondary">15</Badge>
              </div>
              <div className="flex items-center justify-between text-gray-600 hover:text-brand-orange cursor-pointer">
                <span>Tools & Equipment</span>
                <Badge variant="secondary">42</Badge>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t">
            <h3 className="text-lg font-bold text-brand-navy mb-4">Price Range</h3>
            <div className="space-y-4">
              <input className="w-full accent-brand-orange" max="1000" min="0" type="range" />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>€0</span>
                <span>€1000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" className="rounded-[8px]">&larr; Previous</Button>
              <Button className="bg-brand-navy text-white rounded-[8px]">1</Button>
              <Button variant="ghost" className="rounded-[8px]">2</Button>
              <Button variant="ghost" className="rounded-[8px]">3</Button>
              <Button variant="outline" className="rounded-[8px]">Next &rarr;</Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ id, title, category, price, image }: { id: number, title: string, category: string, price: string, image: string }) {
  return (
    <div className="bg-white p-4 rounded-[8px] shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow group">
      <Link className="block" href={`/products/${id}`}>
        <div className="bg-gray-50 rounded-[8px] mb-4 aspect-square flex items-center justify-center overflow-hidden">
          <img alt={title} className="object-contain w-4/5 h-4/5 group-hover:scale-110 transition-transform duration-500" src={image} />
        </div>
      </Link>
      <Link href={`/products/${id}`}>
        <h4 className="font-bold text-brand-navy text-lg line-clamp-1 hover:text-brand-orange transition-colors">{title}</h4>
      </Link>
      <p className="text-sm text-gray-500 mb-4">{category}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-2xl font-extrabold text-brand-navy">€{price}</span>
        <Button size="icon" className="bg-brand-navy hover:bg-blue-800 text-white p-2 rounded-[8px] transition-colors">
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
