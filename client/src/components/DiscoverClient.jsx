"use client";

import { useState } from "react";
import Link from "next/link";
import { Grid, TrendingUp, Palette, Music, DollarSign, Smile, Laptop, Heart, Trophy, Book, Users } from "lucide-react";

const INITIAL_CATEGORIES = [
  { id: 'all', label: 'All Communities', icon: Grid },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'hobbies', label: 'Hobbies', icon: Palette },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'money', label: 'Business & Finance', icon: DollarSign },
  { id: 'spirituality', label: 'Spirituality', icon: Smile },
  { id: 'tech', label: 'Technology', icon: Laptop },
  { id: 'health', label: 'Health & Fitness', icon: Heart },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'self', label: 'Self Improvement', icon: Book },
];

const MOCK_COMMUNITIES = Array.from({ length: 15 }).map((_, i) => ({
  slug: `community-${i}`,
  title: [
    'Maker School: AI Automation', 'AI SEO Mastery Pro', 'Pay Per Lead Academy', 
    'Health = Looks', 'Viral You: Organic Growth', 'The Housing Dept.',
    'No-Code Founders', 'Digital Nomad Guild', 'Design Systems 101',
    'Indie Hackers Club', 'Web3 Innovators', 'Content Creator Pro',
    'SaaS Builders', 'Mindful Leaders', 'Fitness Bootcamp'
  ][i % 15],
  desc: 'A premium community designed to help you connect, learn, and grow your skills with like-minded individuals. Exclusive resources included.',
  members: `${((i * 1.3) % 10 + 1).toFixed(1)}k`,
  price: i % 3 === 0 ? 'Free' : `$${(i * 47) % 200 + 10}/month`,
  category: ['tech', 'tech', 'money', 'health', 'trending', 'money', 'tech', 'hobbies', 'tech', 'money', 'tech', 'trending', 'tech', 'spirituality', 'health'][i % 15],
  cover: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=600&h=300&fit=crop`,
  icon: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=64&h=64&fit=crop&crop=faces`
}));

// Provide some stable working images for the first 3
MOCK_COMMUNITIES[0].cover = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop";
MOCK_COMMUNITIES[1].cover = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop";
MOCK_COMMUNITIES[2].cover = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=300&fit=crop";
MOCK_COMMUNITIES[0].icon = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop";
MOCK_COMMUNITIES[1].icon = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop";
MOCK_COMMUNITIES[2].icon = "https://images.unsplash.com/photo-1601455763557-eba545aabe16?w=64&h=64&fit=crop";

import { useSearchStore } from "@/store/useSearchStore";

export default function DiscoverClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { searchQuery } = useSearchStore();
  const ITEMS_PER_PAGE = 9;

  let filtered = MOCK_COMMUNITIES;
  if (activeCategory !== 'all') {
    filtered = filtered.filter(c => c.category === activeCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[240px] shrink-0 md:sticky md:top-24 md:self-start">
        <h2 className="text-xs font-bold text-muted-fg uppercase tracking-wider mb-4 px-3">Categories</h2>
        <nav className="flex flex-col gap-1">
          {INITIAL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium transition-all ${
                  isActive 
                    ? "bg-brand-primary text-on-brand shadow-sm" 
                    : "text-muted-fg hover:bg-surface-muted hover:text-app-fg"
                }`}
                suppressHydrationWarning
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-on-brand/70" : "text-muted-fg"}`} />
                {cat.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-app-fg tracking-tight mb-3">Explore Communities</h1>
          <p className="text-[16px] text-muted-fg max-w-2xl">
            Find your tribe. Join thousands of creators, builders, and learners in specialized communities tailored to your interests.
          </p>
        </div>

        {/* Grid */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((community) => (
              <Link href={`/${community.slug}`} key={community.slug} className="group flex flex-col bg-surface rounded-xl border border-app-border overflow-hidden hover:shadow-lg hover:border-app-border transition-all duration-300">
                <div className="h-[160px] w-full relative bg-surface-muted overflow-hidden">
                  <img src={community.cover} alt={community.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[12px] font-bold text-app-fg shadow-sm">
                    {community.price}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={community.icon} alt="" className="w-10 h-10 rounded-lg object-cover border border-app-border shrink-0" />
                    <h3 className="font-bold text-[15.5px] text-app-fg leading-tight group-hover:text-brand-accent transition-colors">{community.title}</h3>
                  </div>
                  <p className="text-[13.5px] text-muted-fg line-clamp-2 leading-relaxed mb-4">
                    {community.desc}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-[13px] text-muted-fg font-medium pt-4 border-t border-app-border">
                    <Users className="w-4 h-4 text-muted-fg" />
                    {community.members} Members
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-fg bg-surface border border-dashed border-app-border rounded-xl">
            <p className="font-medium text-[15px]">No communities found in this category.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-md text-[14px] font-medium text-muted-fg hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              suppressHydrationWarning
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[14px] font-semibold transition-all ${
                  currentPage === i + 1 
                    ? "bg-brand-primary text-on-brand" 
                    : "text-muted-fg hover:bg-surface-muted"
                }`}
                suppressHydrationWarning
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-md text-[14px] font-medium text-muted-fg hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              suppressHydrationWarning
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
