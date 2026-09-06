"use client";

import { useState } from "react";
import { Users, Lock, ChevronRight, PlayCircle, CheckCircle2 } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&h=600&fit=crop",
];

export default function CommunityDetailsClient() {
  const openModal = useAuthModalStore((state) => state.openModal);
  const [activeMedia, setActiveMedia] = useState(GALLERY_IMAGES[0]);

  return (
    <div className="min-h-screen bg-ground pb-20">
      
      {/* Immersive Hero Cover */}
      <div className="w-full h-[320px] md:h-[400px] relative bg-ink border-b border-divider">
        <img src={activeMedia} alt="Cover" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"></div>
        
        {/* Breadcrumb over cover */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-white/80 text-[13px] font-medium">
          <span>Communities</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Maker School</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1100px] mx-auto px-6 -mt-16 relative z-10 flex flex-col lg:flex-row gap-10">
        
        {/* Left Column (Main Info) */}
        <div className="flex-1">
          <div className="bg-surface rounded-2xl p-8 border border-divider shadow-soft mb-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-tight mb-3">Maker School: AI Automation</h1>
                <p className="text-[16px] text-sand-700 leading-relaxed max-w-2xl">
                  Get your first client for an AI automation business in 90 days or your money back. Daily AI coaching, AI templates, and more.
                </p>
              </div>
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop" className="w-16 h-16 rounded-xl border-2 border-surface shadow-md bg-surface shrink-0" alt="Icon" />
            </div>

            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-divider text-[14px] text-sand-700 font-medium mb-8">
              <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Private</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> 2.4k Members</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-online"></span> 110 Online</div>
              <div className="ml-auto flex items-center gap-2 text-ink bg-sand-100 px-3 py-1 rounded-full text-xs font-bold">
                By Nick Saraev
              </div>
            </div>

            <h3 className="text-xl font-bold text-ink mb-4">About this community</h3>
            
            {/* Gallery Mini-Selector */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {GALLERY_IMAGES.map((img, idx) => (
                <button 
                  key={idx} onClick={() => setActiveMedia(img)}
                  className={`relative shrink-0 w-32 h-20 rounded-lg overflow-hidden transition-all ${activeMedia === img ? 'ring-2 ring-brand opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && <PlayCircle className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>

            <div className="prose max-w-none text-[15px] leading-relaxed text-ink space-y-4">
              <p>Maker School is the fastest & most affordable way to get client #1 for AI automation with tools like Claude Code, Codex, n8n and more.</p>
              
              <div className="bg-sand-100 p-5 rounded-xl border border-divider my-6">
                <h4 className="font-bold text-ink mb-3 flex items-center gap-2">What&apos;s inside <span className="text-sand-700 font-normal">(worth +$40K)</span></h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-sand-700 shrink-0 mt-0.5" /> 218 exclusive videos & guides: a day-by-day roadmap</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-sand-700 shrink-0 mt-0.5" /> Live coaching: I respond to almost every post each day</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-sand-700 shrink-0 mt-0.5" /> &gt;50 templates/scripts for AI, lead gen & sales</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-sand-700 shrink-0 mt-0.5" /> My exact tech stack and proposal scripts</li>
                </ul>
              </div>

              <p>Join now & land AI client #1 in 90 days or get a full refund. No questions asked.</p>
            </div>

          </div>
        </div>

        {/* Right Column (Sticky Join Card) */}
        <div className="w-full lg:w-[340px] shrink-0">
          <div className="sticky top-24 bg-surface rounded-2xl border border-divider shadow-lg p-6">
            <div className="text-[13px] font-bold text-sand-700 tracking-wider uppercase mb-1">Membership</div>
            <div className="text-3xl font-extrabold text-ink mb-2">$184<span className="text-lg text-sand-700 font-medium">/month</span></div>
            <p className="text-[14px] text-sand-700 font-medium mb-6">
              Cancel anytime. Instant access to all courses, community feeds, and daily coaching.
            </p>

            <button 
              onClick={() => openModal('signup')}
              className="w-full h-12 bg-brand hover:bg-brand-600 text-ground font-bold text-[15px] rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Join Community
            </button>
            <p className="text-center text-[12px] text-sand-700 font-medium mt-4">
              Secure checkout. 90-day money-back guarantee.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
