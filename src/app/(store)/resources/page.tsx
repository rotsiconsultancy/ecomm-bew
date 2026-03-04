import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, FileText, CheckCircle2, Search, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ProfessionalResourcesPage() {
  const blogs = [
    { id: 1, title: 'Optimizing Your Industrial Supply Chain for 2024', category: 'Supply Chain', author: 'Dr. Sarah Mitchell', date: 'Oct 24, 2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRP3Wq9G1cgCmFsfxnYrpIWanIV-1QpyQgxWp_V6L9vTPhSICNedPGgDr2ssfEepI5t1My3GGv0Afgi2Q1eyG_S-Cj85IKKy8gRzabizfM03akbfIPBoIpMpZwth0AiRBIqN_A5GSJfC8DasJlR29ouaAOEE7OVNf6aQL_GcHSZfHCjrws8BHaxaKvC3KB_4dVhbXbvWSZYP37AWrQpY_R-72yUgZwnFD1pzc5gzlKK2ZxMAaJ6nGZYzJgsvZDZB9cJ2jZKhnw6Kvp' },
    { id: 2, title: 'Sustainable Timber: Regulations and Standards in Europe', category: 'Sustainability', author: 'Mark Henderson', date: 'Oct 18, 2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIR0i1TUi9x4VneDk2A5LWpVl5VarrpO8sAPEk_DX8Z7gyAaOgzym9eyvzgWHwaPsuii3e9KgisZeMos3ycsjdhigta5hNpE08lhoMEl_MJ9mOEkuowTa8FwSr2WFu4SjAjx0fKgJKCByP0nvScDIPH5sEeBYFrnOrKu0Br9r1PWcpC55MeAHWYEKrgK3uHtJwl5d52_gnw_8n2LzR43GN0GzSCU4UuU_mPNGGRPQB73KoSVwhj3MWdZzS3uE0fS1E4NXsRXveKPMa' },
    { id: 3, title: 'Advanced Sealants: Choosing the Right Adhesive for Construction', category: 'Chemicals', author: 'Emma Collins', date: 'Oct 12, 2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCid193PAd9zWoNGZaJw-eQ4YAhSaAyxfJl_E7bWuOwpyLnv79PWlZRuRG20HzqspE1s3Vrv62fa1jH_Mu26W1kdtk1ejwR-cQw3tBcRc9aS3FiljjmyDOpIA449o7jOMcGzzwsn1QpPe4hRiU1LO27crgfBopSGKe_6cJdQ71pTe799bxtB9vJdzLsaz9Eoq3KT4w3v4JLLJqw3othFd_tnikNWK2ZEle1U__V1fz0omOgTWbwhZsbX6KIIiKhIs78UA4NDSZ7p7E0' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy mb-2">Technical Resources</h1>
          <p className="text-gray-500">Industry insights, technical guides, and professional advice.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Input className="pl-10 pr-4 py-2 border border-gray-300 rounded-[8px] w-64" placeholder="Search resources..." type="text" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold">Subscribe</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Blog Feed */}
        <div className="lg:col-span-3 space-y-12">
          {blogs.map((blog) => (
            <Link key={blog.id} className="group block" href="/blog/individual">
              <Card className="rounded-[8px] border-none shadow-none group-hover:shadow-xl transition-all overflow-hidden flex flex-col md:flex-row gap-8">
                <div className="md:w-80 h-64 flex-shrink-0 overflow-hidden rounded-[8px]">
                    <img alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={blog.image} />
                </div>
                <div className="flex-1 py-4 space-y-4 pr-4">
                    <Badge className="bg-brand-orange">{blog.category}</Badge>
                    <h2 className="text-3xl font-extrabold text-brand-navy group-hover:text-brand-orange transition-colors line-clamp-2">{blog.title}</h2>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{blog.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>6 min read</span>
                        </div>
                    </div>
                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                        Industry leaders are increasingly focusing on the integration of digital technologies and sustainable practices to streamline operations and reduce environmental impact. In this comprehensive guide, we explore the key trends and strategies that will define the industrial supply chain in 2024...
                    </p>
                    <div className="pt-4 flex items-center gap-2 text-brand-orange font-bold group-hover:gap-4 transition-all">
                        <span>Read Full Article</span>
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </div>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          <div className="pt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" className="rounded-[8px]">Previous</Button>
              <Button className="bg-brand-navy text-white rounded-[8px]">1</Button>
              <Button variant="ghost" className="rounded-[8px]">2</Button>
              <Button variant="ghost" className="rounded-[8px]">3</Button>
              <Button variant="outline" className="rounded-[8px]">Next</Button>
            </nav>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
            <div className="bg-brand-navy p-8 rounded-[8px] text-white space-y-6 shadow-xl">
                <h3 className="text-xl font-bold">Download Catalog</h3>
                <p className="text-sm text-gray-300">Get our full 2024 Product Catalog with technical specs and wholesale pricing tiers.</p>
                <Button className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12">
                    <FileText className="mr-2 h-5 w-5" />
                    Download PDF (45MB)
                </Button>
            </div>

            <div className="space-y-6">
                <h4 className="text-lg font-bold text-brand-navy border-l-4 border-brand-orange pl-4">Popular Categories</h4>
                <div className="flex flex-wrap gap-2">
                    {['Supply Chain', 'Timber Tech', 'Industrial Chemicals', 'Sustainability', 'Market Trends', 'Logistics', 'Regulations'].map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-4 py-2 rounded-full cursor-pointer hover:bg-brand-orange hover:text-white transition-colors">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <Card className="rounded-[8px] border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b">
                    <h4 className="font-bold text-brand-navy">Newsletter</h4>
                </div>
                <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-gray-500">Join 5,000+ industry professionals receiving our monthly insights.</p>
                    <Input className="rounded-[8px]" placeholder="Email address" />
                    <Button className="w-full bg-brand-navy hover:bg-blue-800 text-white rounded-[8px] font-bold">Sign Up</Button>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
