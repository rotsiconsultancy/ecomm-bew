import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-brand-navy text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
                Your Partner in <span className="text-brand-orange">Industrial Materials</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-lg">
                Reliable supply chain solutions for Quality Chemicals & Timber. Delivering excellence across Europe's manufacturing sectors.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-7 rounded-[8px] font-bold text-lg transition-transform hover:-translate-y-1">
                  <Link href="/products">
                    Explore Catalog
                  </Link>
                </Button>
                <Button variant="outline" className="border-2 border-white hover:bg-white hover:text-brand-navy text-white px-8 py-7 rounded-[8px] font-bold text-lg transition-all bg-transparent">
                  Learn More
                </Button>
              </div>
            </div>
            {/* Hero Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-orange/10 rounded-[8px] blur-3xl"></div>
              <img
                alt="Industrial materials"
                className="relative z-10 w-full h-128 object-cover rounded-[8px] shadow-2xl border border-white/10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRP3Wq9G1cgCmFsfxnYrpIWanIV-1QpyQgxWp_V6L9vTPhSICNedPGgDr2ssfEepI5t1My3GGv0Afgi2Q1eyG_S-Cj85IKKy8gRzabizfM03akbfIPBoIpMpZwth0AiRBIqN_A5GSJfC8DasJlR29ouaAOEE7OVNf6aQL_GcHSZfHCjrws8BHaxaKvC3KB_4dVhbXbvWSZYP37AWrQpY_R-72yUgZwnFD1pzc5gzlKK2ZxMAaJ6nGZYzJgsvZDZB9cJ2jZKhnw6Kvp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-navy mb-10 border-l-4 border-brand-orange pl-4">Industrial Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard
              title="Silicones"
              subtitle="High-grade industrial sealants"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuCHBV2Qk3-Wmw5dN4v0kEF1dZtKYhmt5EXmCaVyr32KTEYllmkCzgbL6ZaB9Mveadt8dTOQVl4TO2GPc5H3Yjn0DPtzQOyRuTAZGwHMdXtMgLSy2UnX0-lQVp7bHp6ZmQ2apl4B8ukBqakZMoeM0-uKSR97E_NdbK3xEBB09KCmPZWEtAWYBWiBpPPR6me2_j-e2OTOdr1TGF0cCsIMZbAnEClzOU2N9ZIJwjQAh7he-VIgRO2l1WW8MGch9n4WOvdtvld3ExppBZDf"
            />
            <CategoryCard
              title="MDF Boards"
              subtitle="Premium timber products"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuAA6uq5xFhbEOLVT8T4dSpB-bghLH8agVIAfgHIGws966SkJ4mzKKJ5noGucqxsa2GfCpftGx72UiWJCf59af5faAHhwYVxK6d5fD-JBbzubaIcuGL22ijlebez6ZStNGmb4y0Kt287kSUfN3MiLsEj8oWF5cyefA4E-nEKxKINPsFEwaX7xrkw5JHKKjN_2XRAot-xf5QLXo90y4PBWzA79jFlihTTvVYDFKI3iEZ7KlW552WGIDFFzo0P7P6Q9nQ0Lq0IvkII1YWv"
            />
            <CategoryCard
              title="Tools"
              subtitle="Professional equipment"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuBUrVSX7jAxVLE-Yyx0VRLNS6BjNlWIFgi33USn-082grCvrDOurAiz2Y7ygBaUWIJApKUjJ4dIxPCeOcfxqzqpm1gmGQaMdspVFZUwPSkKHTbRNb9N84VO2WXXXsW4A9BuwPwHnGCIrzMdqXZsMFMr6EOGUsm1f21h9OUneg0gY_CT_sQHuuQ6050dKV6uZ2Te0Fo8SQsq5tq3NAshEAXDGKAKGgQNmYhrqn2bpQx1KCaux8b-oGpdk7BqXDCIYii9xvQaI84GUfpP"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-brand-navy">Featured Products</h2>
              <p className="text-gray-500 mt-2">Best-selling industrial solutions ready for dispatch</p>
            </div>
            <Link className="text-brand-navy font-semibold hover:underline decoration-brand-orange decoration-2" href="/products">
              View All Products →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard
              title="Pro-Seal Adhesive 500ml"
              category="Chemical & Sealants"
              price="29.99"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuCid193PAd9zWoNGZaJw-eQ4YAhSaAyxfJl_E7bWuOwpyLnv79PWlZRuRG20HzqspE1s3Vrv62fa1jH_Mu26W1kdtk1ejwR-cQw3tBcRc9aS3FiljjmyDOpIA449o7jOMcGzzwsn1QpPe4hRiU1LO27crgfBopSGKe_6cJdQ71pTe799bxtB9vJdzLsaz9Eoq3KT4w3v4JLLJqw3othFd_tnikNWK2ZEle1U__V1fz0omOgTWbwhZsbX6KIIiKhIs78UA4NDSZ7p7E0"
            />
            <ProductCard
              title="Premium MDF Board 18mm"
              category="Timber & Boards"
              price="45.50"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuAsE8gZ4V4PPHEYSE7qCjJNoeFLSBiRnt3YfNDzd-QAk3VMv1m75VGcWtigh4E5aytAWmayB98ZPoF068oLY3B78Cs48m-Pbbnbsuohuf5JxfsSrUDy70PU7_yMKZGbFgfFPT8E-oJX8M6SbrL9KFFRDfXPGxwKNQXeQC2DjtiVz7JFjwNDQzouYxmSx1ze3wqmntOcHGtFir767ahdA-TiRKuGW-T_PxL2S0BFkAgn3cK6CrOGEc4lQ7b87NtXXYRMdh-v-x42Q-NC"
            />
            <ProductCard
              title="Industrial Drill Bit Set (12pc)"
              category="Professional Tools"
              price="89.00"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuDVeCBW0GJckaeJnpjc-ZC1LbFY1DGGWqDqDUjycKNHZGQBaMZk9PuaRcTCnVg3V3_74AID-YaACf4fEy0MHzVXWUK0OCxGvyTP7IGNA-_zA8En4Hqc4dXLgr1hIeHLTvk0-1MzKqxW2X_0l_xdhmBDBa3YIUJb7w9vI2qzuss64lVyEEb4KyMA7WJfy9NjPu5VLZRFrTAwJvPl6KC6rAAqxsfbAIgNMYj4SqTAo4Lc88J1MY2Tbbxm67NrfFhiZXbcHvitBf9y429q"
            />
            <ProductCard
              title="C24 Treated Timber 4.8m"
              category="Timber & Construction"
              price="12.95"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuBIR0i1TUi9x4VneDk2A5LWpVl5VarrpO8sAPEk_DX8Z7gyAaOgzym9eyvzgWHwaPsuii3e9KgisZeMos3ycsjdhigta5hNpE08lhoMEl_MJ9mOEkuowTa8FwSr2WFu4SjAjx0fKgJKCByP0nvScDIPH5sEeBYFrnOrKu0Br9r1PWcpC55MeAHWYEKrgK3uHtJwl5d52_gnw_8n2LzR43GN0GzSCU4UuU_mPNGGRPQB73KoSVwhj3MWdZzS3uE0fS1E4NXsRXveKPMa"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryCard({ title, subtitle, image }: { title: string, subtitle: string, image: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[8px] bg-gray-100 aspect-4/3 cursor-pointer">
      <img
        alt={title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        src={image}
      />
      <div className="absolute inset-0 bg-linear-to-t from-brand-navy/80 to-transparent"></div>
      <div className="absolute bottom-6 left-6">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-200 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function ProductCard({ title, category, price, image }: { title: string, category: string, price: string, image: string }) {
  return (
    <div className="bg-white p-4 rounded-[8px] shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="bg-gray-50 rounded-[8px] mb-4 aspect-square flex items-center justify-center overflow-hidden">
        <img alt={title} className="object-contain w-4/5 h-4/5" src={image} />
      </div>
      <h4 className="font-bold text-brand-navy text-lg line-clamp-1">{title}</h4>
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
