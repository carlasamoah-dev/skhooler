import Link from "next/link";
import { Lock, Users, Tag, Play } from "lucide-react";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: "Maker School: AI Automation",
    description: "Get your first client for an AI automation business in 90 days or your money back.",
  };
}

export default function CommunityDetailsPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 pt-8 pb-16 flex flex-col lg:flex-row gap-8">
      {/* Left Column */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Maker School: AI Automation</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="flex text-[#facc15]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </div>
          <span className="text-[13px] text-gray-500 font-medium">5.0 • 85 reviews</span>
        </div>

        {/* Gallery */}
        <div className="mb-6">
          <div className="w-full bg-[#1e2025] rounded-xl mb-2 overflow-hidden aspect-[16/9] flex items-center justify-center relative">
            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop" alt="Main cover" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="aspect-[16/9] rounded-lg overflow-hidden relative cursor-pointer opacity-100 ring-2 ring-gray-900">
              <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=112&fit=crop" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-8 h-6 bg-black/80 rounded flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[16/9] rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-opacity bg-gray-200">
                <img src={`https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=112&fit=crop&sig=${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Meta info bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 border-b border-gray-100 text-[15px] font-medium text-gray-700 mb-8">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" /> Private
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" /> 2.4k members
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" /> $184 /month
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=faces" alt="Author" className="w-6 h-6 rounded-full" />
            <span>By Nick Saraev</span>
            <span className="text-blue-500">💎</span>
            <span>🔥</span>
          </div>
        </div>

        {/* Prose Description */}
        <div className="text-[15px] leading-relaxed text-gray-800 space-y-4">
          <p>
            Maker School is the fastest & most affordable way to get client #1 for AI automation with tools like Claude Code, Codex, n8n and more.
          </p>
          <p>
            Get your first paying AI client in 90d or your money back.
          </p>
          <p className="font-semibold text-gray-900 mt-6">
            What's inside (worth +$40K) ⬇️
          </p>
          <ul className="space-y-1">
            <li>✅ 218 exclusive videos & guides: a day-by-day roadmap to AI client #1</li>
            <li>✅ Live coaching: I respond to almost every post each day</li>
            <li>✅ $21K in IMMEDIATE discounts to AI automation platforms</li>
            <li>✅ Full end-to-end courses (Claude n8n & more)</li>
            <li>✅ &gt;50 templates/scripts for AI, lead gen & sales 📦</li>
            <li>✅ 3 underground lead gen methods to find & close high-ticket clients FAST</li>
            <li>✅ My stack: the proposals/scripts/AI assets I used to do $160K/m across two agencies</li>
          </ul>

          <p className="font-semibold text-gray-900 mt-6">
            BONUSES (worth +$10K) 🎁
          </p>
          <ul className="space-y-1">
            <li>🎁 Daily QA w Nick: I answer & record custom vids for you</li>
            <li>🎁 Weekly calls w Nick: ask anything!</li>
            <li>🎁 Jobs: get hired for AI by other members</li>
            <li>🎁 Over 2K AI consultants: build your network, meet people IRL & grow 🌍</li>
          </ul>

          <p className="text-[#d97706] font-medium mt-6">
            ⚠️ Price increasing to $194/mo soon!
          </p>
          
          <p className="font-medium mt-4">
            Join now & land AI client #1 in 90d or get a full refund.
          </p>
        </div>
      </div>

      {/* Right Column - Sticky Sidebar */}
      <div className="w-full lg:w-[320px] shrink-0">
        <div className="sticky top-20 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          {/* Cover */}
          <div className="h-[120px] bg-[#2563eb] relative">
             <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop" className="w-full h-full object-cover" />
          </div>
          
          {/* Body */}
          <div className="p-6">
            <h2 className="text-[19px] font-bold text-gray-900 mb-1 leading-tight">Maker School: AI Automation</h2>
            <p className="text-[13px] text-gray-400 mb-4 font-medium">skool.com/makerschool</p>
            
            <p className="text-[13px] text-gray-700 leading-relaxed mb-6">
              Get your first client for an AI automation business in 90 days or your money back. Daily AI coaching, AI templates, +$30K saved in tools. $184/mo.
            </p>

            <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-4 mb-6">
              <div className="text-center border-r border-gray-100 last:border-0">
                <div className="font-bold text-[17px] text-gray-900">2.4k</div>
                <div className="text-[11px] text-gray-400 font-medium">Members</div>
              </div>
              <div className="text-center border-r border-gray-100">
                <div className="font-bold text-[17px] text-gray-900">110</div>
                <div className="text-[11px] text-gray-400 font-medium">Online</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-[17px] text-gray-900">2</div>
                <div className="text-[11px] text-gray-400 font-medium">Admins</div>
              </div>
            </div>

            <button className="w-full bg-[#fcd34d] hover:bg-[#fbbf24] text-gray-900 font-bold text-[15px] py-3 rounded-md transition-colors uppercase tracking-wide">
              Join $184/month
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
              Powered by <span className="text-black font-bold text-xs tracking-tighter">skhooler</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
