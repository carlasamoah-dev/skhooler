import Link from "next/link";
import { Search } from "lucide-react";

export const metadata = {
  title: "Discover communities",
  description: "Find and join communities of like-minded people. Learn new skills, network, and grow together.",
};

const CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: '🔥', active: true },
  { id: 'hobbies', label: 'Hobbies', icon: '🎨' },
  { id: 'music', label: 'Music', icon: '🎸' },
  { id: 'money', label: 'Money', icon: '💰' },
  { id: 'spirituality', label: 'Spirituality', icon: '🧘' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'health', label: 'Health', icon: '🥑' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'self', label: 'Self-i...', icon: '📚' },
  { id: 'more', label: 'More...', icon: '' },
];

const COMMUNITIES = [
  {
    slug: 'makerschool',
    title: 'Maker School: AI Automation',
    desc: 'Get your first client for an AI automation business in 90 days or your money back. Daily AI coaching, AI templates, +$30K...',
    members: '2.4k',
    price: '$184/month',
    authorImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop&crop=faces',
    cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop&crop=faces'
  },
  {
    slug: 'aiseo',
    title: 'AI SEO Mastery Pro',
    desc: 'Weekly live calls with a 7-figure agency owner. Advanced AI + SEO strategies we actually use. No theory—just what\'s...',
    members: '701',
    price: '$217/month',
    authorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=faces',
    cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=faces'
  },
  {
    slug: 'payperlead',
    title: 'Pay Per Lead Academy',
    desc: 'Learn how to scale a Pay-Per-Lead agency and make the easiest money you\'ve ever made in your life.',
    members: '26',
    price: '$250/month',
    authorImage: 'https://images.unsplash.com/photo-1601455763557-eba545aabe16?w=64&h=64&fit=crop&crop=faces',
    cover: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1601455763557-eba545aabe16?w=64&h=64&fit=crop&crop=faces'
  },
  {
    slug: 'healthlooks',
    title: 'Health = Looks',
    desc: 'I improve people\'s looks by fixing their health naturally.',
    members: '7.5k',
    price: '$39/month',
    authorImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=64&h=64&fit=crop&crop=faces',
    cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=64&h=64&fit=crop&crop=faces'
  },
  {
    slug: 'viralyou',
    title: 'Viral You: Organic Growth',
    desc: 'Get your first customer from organic content in 90 days without fancy funnels, ads, posting daily, or losing yourself....',
    members: '278',
    price: '$197/month',
    authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=faces',
    cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=faces'
  },
  {
    slug: 'housingdept',
    title: 'The Housing Dept.',
    desc: 'Build your housing business, win prizes, make friends, change lives.',
    members: '523',
    price: '$97/month',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    cover: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=300&fit=crop',
    icon: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces'
  }
];

export default function DiscoverPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 pb-16">
      {/* Hero Section */}
      <div className="pt-16 pb-12 flex flex-col items-center text-center">
        <h1 className="text-[32px] font-bold text-gray-900 mb-2">Discover communities</h1>
        <p className="text-[17px] text-gray-900 font-medium">
          or <Link href="#" className="text-skool-blue hover:underline">create your own</Link>
        </p>

        {/* Search Bar */}
        <div className="mt-8 w-full max-w-[640px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for anything" 
            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-gray-400 focus:ring-0 text-[15px]"
          />
        </div>

        {/* Categories */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-[800px]">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                cat.active 
                  ? "bg-[#8a94a6] text-white border-[#8a94a6]" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.label}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
            Filter <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
          </button>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {COMMUNITIES.map((community) => (
          <Link href={`/${community.slug}`} key={community.slug} className="block group">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-[380px] flex flex-col">
              <div className="h-[180px] w-full shrink-0 relative border-b border-gray-100">
                <img src={community.cover} alt={community.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <img src={community.icon} alt="" className="w-8 h-8 rounded-md object-cover border border-gray-200" />
                  <h3 className="font-bold text-[15px] text-gray-900 line-clamp-1 group-hover:underline">{community.title}</h3>
                </div>
                <p className="text-[13px] text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                  {community.desc}
                </p>
                <div className="mt-auto text-[13px] text-gray-500 font-medium">
                  {community.members} Members • {community.price}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination & Footer */}
      <div className="mt-16 flex flex-col items-center">
        <div className="flex items-center gap-1 text-[13px] font-medium text-gray-500">
          <button className="px-3 py-1 text-gray-300 cursor-not-allowed">{"< Previous"}</button>
          <button className="w-8 h-8 rounded-full bg-[#fde047] text-gray-900 flex items-center justify-center">1</button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">2</button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">3</button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">4</button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">5</button>
          <span className="px-2">...</span>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">34</button>
          <button className="px-3 py-1 hover:text-gray-900">{"Next >"}</button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-[13px] text-gray-400 font-medium">
          <Link href="#" className="hover:text-gray-600">Community</Link>
          <Link href="#" className="hover:text-gray-600">Affiliates</Link>
          <Link href="#" className="hover:text-gray-600">Support</Link>
          <Link href="#" className="hover:text-gray-600">Careers</Link>
          <Link href="#" className="hover:text-gray-600">•••</Link>
        </div>
      </div>
    </div>
  );
}
