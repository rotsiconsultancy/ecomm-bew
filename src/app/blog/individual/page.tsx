import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, Clock, ChevronLeft, Send, CheckCircle2, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function IndividualBlogPage() {
  const blog = {
    title: 'Optimizing Your Industrial Supply Chain for 2024: Sustainable Practices and Digital Integration',
    category: 'Supply Chain Strategy',
    author: 'Dr. Sarah Mitchell',
    date: 'Oct 24, 2023',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRP3Wq9G1cgCmFsfxnYrpIWanIV-1QpyQgxWp_V6L9vTPhSICNedPGgDr2ssfEepI5t1My3GGv0Afgi2Q1eyG_S-Cj85IKKy8gRzabizfM03akbfIPBoIpMpZwth0AiRBIqN_A5GSJfC8DasJlR29ouaAOEE7OVNf6aQL_GcHSZfHCjrws8BHaxaKvC3KB_4dVhbXbvWSZYP37AWrQpY_R-72yUgZwnFD1pzc5gzlKK2ZxMAaJ6nGZYzJgsvZDZB9cJ2jZKhnw6Kvp'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Blog Content */}
        <article className="lg:flex-1 space-y-12">
            <Link className="flex items-center gap-2 text-sm font-bold text-brand-orange hover:underline mb-8" href="/resources">
                <ChevronLeft className="h-4 w-4" />
                Back to Technical Resources
            </Link>

            <header className="space-y-6">
                <Badge className="bg-brand-orange px-4 py-1 text-sm">{blog.category}</Badge>
                <h1 className="text-5xl font-extrabold text-brand-navy leading-tight tracking-tight">
                    {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-8 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-navy/10 flex items-center justify-center border border-brand-navy">
                            <User className="h-5 w-5 text-brand-navy" />
                        </div>
                        <span className="font-bold text-brand-navy">{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{blog.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>12 min read</span>
                    </div>
                </div>
            </header>

            <div className="aspect-[21/9] rounded-[8px] overflow-hidden shadow-2xl">
                <img alt={blog.title} className="w-full h-full object-cover" src={blog.image} />
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 space-y-8 leading-relaxed">
                <p className="text-xl font-medium text-brand-navy leading-relaxed">
                    The industrial sector is undergoing a profound transformation. As we look towards 2024, the dual pressures of environmental sustainability and digital efficiency are reshaping how materials are sourced, transported, and managed. In this comprehensive analysis, we explore the key strategies for building a resilient, future-ready supply chain.
                </p>
                <h2 className="text-3xl font-extrabold text-brand-navy pt-6 border-b border-gray-100 pb-4">The Shift Towards Circular Economy</h2>
                <p>
                    Transitioning to a circular economy is no longer just a corporate social responsibility initiative; it's a strategic necessity. For companies dealing with timber and chemical materials, this means looking beyond the traditional linear model of "take-make-dispose." We are seeing a significant rise in the demand for recycled industrial materials and a renewed focus on product lifecycle management.
                </p>
                <div className="bg-gray-50 p-8 rounded-[8px] border-l-4 border-brand-orange shadow-sm my-12">
                    <p className="italic text-lg text-brand-navy font-semibold">
                        "The companies that will thrive in 2024 are those that view sustainability as a driver of innovation rather than a regulatory burden."
                    </p>
                </div>
                <h2 className="text-3xl font-extrabold text-brand-navy pt-6 border-b border-gray-100 pb-4">Digital Twin Integration</h2>
                <p>
                    The adoption of Digital Twin technology is revolutionizing warehouse and logistics management. By creating a virtual replica of physical assets and processes, industrial brokers can predict bottlenecks, optimize storage configurations, and provide real-time tracking with unprecedented accuracy.
                </p>
                <ul className="space-y-4 list-disc pl-6 text-brand-navy font-semibold">
                    <li>Real-time inventory visibility across multiple locations.</li>
                    <li>Predictive maintenance for logistics fleets and machinery.</li>
                    <li>Automated compliance monitoring for hazardous materials.</li>
                </ul>
                <h2 className="text-3xl font-extrabold text-brand-navy pt-6 border-b border-gray-100 pb-4">Conclusion: Building Resilience</h2>
                <p>
                    Resilience in the industrial supply chain comes from a combination of diverse sourcing, robust digital infrastructure, and a commitment to sustainable growth. By implementing these strategies today, businesses can ensure they are well-positioned for the challenges and opportunities of the coming year.
                </p>
            </div>

            <footer className="pt-12 border-t border-gray-100">
                <div className="bg-brand-navy rounded-[8px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h4 className="text-2xl font-bold">Ready to optimize your supply chain?</h4>
                        <p className="text-gray-300">Speak with our industrial specialists today for a custom consultation.</p>
                    </div>
                    <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold px-8 h-12 shadow-lg active:scale-95 transition-all">
                        Get Professional Consultation
                    </Button>
                </div>
            </footer>
        </article>

        {/* Blog Sidebar */}
        <aside className="w-full lg:w-96 space-y-12">
            <Card className="rounded-[8px] border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-6 border-b">
                    <h4 className="font-bold text-brand-navy">Search Resources</h4>
                </div>
                <CardContent className="p-6">
                    <div className="relative">
                        <Input className="pl-10 pr-4 py-2 border border-gray-300 rounded-[8px] w-full" placeholder="Search topics..." type="text" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <h4 className="text-xl font-extrabold text-brand-navy border-l-4 border-brand-orange pl-4 uppercase tracking-widest text-sm">Related Articles</h4>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Link key={i} className="flex gap-4 group" href="#">
                            <div className="h-20 w-20 rounded-[8px] bg-gray-100 flex-shrink-0 overflow-hidden">
                                <img alt="Related" className="w-full h-full object-cover group-hover:scale-110 transition-transform" src={blog.image} />
                            </div>
                            <div className="space-y-1">
                                <h5 className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors line-clamp-2 text-sm">Sustainable Timber: Regulations and Standards</h5>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sustainability • 5 min read</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-brand-navy p-8 rounded-[8px] text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FileText className="h-24 w-24 text-white" />
                </div>
                <h3 className="text-xl font-bold">Industry Whitepaper</h3>
                <p className="text-sm text-gray-300">Download our latest research on global industrial material trends and price forecasts for 2024.</p>
                <Button className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12">
                    Access Whitepaper
                </Button>
            </div>

            <div className="space-y-6">
                <h4 className="text-xl font-extrabold text-brand-navy border-l-4 border-brand-orange pl-4 uppercase tracking-widest text-sm">Share Article</h4>
                <div className="flex gap-4">
                    {['X', 'LinkedIn', 'Facebook', 'Email'].map((social) => (
                        <div key={social} className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all cursor-pointer font-bold text-xs">
                            {social[0]}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
