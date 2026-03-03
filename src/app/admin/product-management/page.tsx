import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function ProductManagementPage() {
  const products = [
    { id: 'BW-TIM-MDF18-2412', name: 'Premium MDF Board 18mm', category: 'Timber & Boards', stock: 450, price: '€45.50', status: 'Active', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsE8gZ4V4PPHEYSE7qCjJNoeFLSBiRnt3YfNDzd-QAk3VMv1m75VGcWtigh4E5aytAWmayB98ZPoF068oLY3B78Cs48m-Pbbnbsuohuf5JxfsSrUDy70PU7_yMKZGbFgfFPT8E-oJX8M6SbrL9KFFRDfXPGxwKNQXeQC2DjtiVz7JFjwNDQzouYxmSx1ze3wqmntOcHGtFir767ahdA-TiRKuGW-T_PxL2S0BFkAgn3cK6CrOGEc4lQ7b87NtXXYRMdh-v-x42Q-NC' },
    { id: 'BW-CHM-PSA500', name: 'Pro-Seal Adhesive 500ml', category: 'Chemicals', stock: 1200, price: '€29.99', status: 'Active', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCid193PAd9zWoNGZaJw-eQ4YAhSaAyxfJl_E7bWuOwpyLnv79PWlZRuRG20HzqspE1s3Vrv62fa1jH_Mu26W1kdtk1ejwR-cQw3tBcRc9aS3FiljjmyDOpIA449o7jOMcGzzwsn1QpPe4hRiU1LO27crgfBopSGKe_6cJdQ71pTe799bxtB9vJdzLsaz9Eoq3KT4w3v4JLLJqw3othFd_tnikNWK2ZEle1U__V1fz0omOgTWbwhZsbX6KIIiKhIs78UA4NDSZ7p7E0' },
    { id: 'BW-TLS-BIT12', name: 'Industrial Drill Bit Set', category: 'Tools', stock: 85, price: '€89.00', status: 'Low Stock', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVeCBW0GJckaeJnpjc-ZC1LbFY1DGGWqDqDUjycKNHZGQBaMZk9PuaRcTCnVg3V3_74AID-YaACf4fEy0MHzVXWUK0OCxGvyTP7IGNA-_zA8En4Hqc4dXLgr1hIeHLTvk0-1MzKqxW2X_0l_xdhmBDBa3YIUJb7w9vI2qzuss64lVyEEb4KyMA7WJfy9NjPu5VLZRFrTAwJvPl6KC6rAAqxsfbAIgNMYj4SqTAo4Lc88J1MY2Tbbxm67NrfFhiZXbcHvitBf9y429q' },
    { id: 'BW-TIM-C24-48', name: 'C24 Treated Timber 4.8m', category: 'Timber & Boards', stock: 15, price: '€12.95', status: 'Out of Stock', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIR0i1TUi9x4VneDk2A5LWpVl5VarrpO8sAPEk_DX8Z7gyAaOgzym9eyvzgWHwaPsuii3e9KgisZeMos3ycsjdhigta5hNpE08lhoMEl_MJ9mOEkuowTa8FwSr2WFu4SjAjx0fKgJKCByP0nvScDIPH5sEeBYFrnOrKu0Br9r1PWcpC55MeAHWYEKrgK3uHtJwl5d52_gnw_8n2LzR43GN0GzSCU4UuU_mPNGGRPQB73KoSVwhj3MWdZzS3uE0fS1E4NXsRXveKPMa' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">Product Management</h1>
          <p className="text-gray-500 mt-2">Manage your inventory, pricing, and product details.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12 px-8">
                <Plus className="mr-2 h-5 w-5" />
                Add New Product
            </Button>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[8px] border-none shadow-sm p-6 flex items-center gap-6">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total SKU</p>
                <p className="text-2xl font-extrabold text-brand-navy">248 Products</p>
            </div>
        </Card>
        <Card className="rounded-[8px] border-none shadow-sm p-6 flex items-center gap-6">
            <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Low Stock Alert</p>
                <p className="text-2xl font-extrabold text-brand-navy">12 SKU</p>
            </div>
        </Card>
        <Card className="rounded-[8px] border-none shadow-sm p-6 flex items-center gap-6">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Price Updates</p>
                <p className="text-2xl font-extrabold text-brand-navy">3 Scheduled</p>
            </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="rounded-[8px] border-none shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Input className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] w-full" placeholder="Search by SKU, Name, or Category..." type="text" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-gray-400 hover:text-brand-navy"><ExternalLink className="h-5 w-5" /></Button>
                <Button variant="ghost" className="text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></Button>
            </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card className="rounded-[8px] border-none shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                <tr>
                    <th className="px-8 py-4">Product Details</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4 text-center">Stock Level</th>
                    <th className="px-8 py-4 text-center">Status</th>
                    <th className="px-8 py-4 text-right">Wholesale Price</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 cursor-pointer group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gray-50 rounded-[8px] border flex items-center justify-center flex-shrink-0">
                                    <img alt={product.name} className="h-4/5 w-4/5 object-contain" src={product.image} />
                                </div>
                                <div>
                                    <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">{product.name}</p>
                                    <p className="text-xs text-gray-400">SKU: {product.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6 font-semibold text-gray-600">{product.category}</td>
                        <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                                <span className="font-extrabold text-brand-navy">{product.stock} units</span>
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${
                                        product.stock > 100 ? 'bg-green-500 w-full' :
                                        product.stock > 50 ? 'bg-yellow-500 w-1/2' :
                                        'bg-red-500 w-1/4'
                                    }`}></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex justify-center">
                                <Badge className={`border-none px-3 py-1 font-bold ${
                                    product.status === 'Active' ? 'bg-green-100 text-green-600' :
                                    product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                    {product.status}
                                </Badge>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-right font-extrabold text-brand-navy">{product.price}</td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-orange"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">Showing 1 to 4 of 248 products</p>
          <div className="flex gap-2">
              <Button variant="outline" disabled className="rounded-[8px]">Previous</Button>
              <Button variant="outline" className="rounded-[8px] hover:bg-brand-navy hover:text-white transition-colors">Next</Button>
          </div>
      </div>
    </div>
  );
}
