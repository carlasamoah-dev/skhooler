"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Lock, ChevronRight, PlayCircle, CheckCircle2, Globe } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useSessionStore } from "@/store/useSessionStore";

function isVideoUrl(url) {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg)$/i) || url.includes("youtube.com") || url.includes("vimeo.com");
}

function getEmbedUrl(url) {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
}

function MediaRenderer({ url, className, autoPlay = false }) {
  if (!url) return null;
  if (isVideoUrl(url)) {
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video 
          src={url} 
          className={className} 
          autoPlay={autoPlay} 
          controls={autoPlay} 
          muted={!autoPlay} 
          loop 
          playsInline 
        />
      );
    } else {
      return (
        <iframe
          src={getEmbedUrl(url)}
          className={className}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
  }
  return <img src={url} alt="Media" className={className} />;
}

export default function CommunityDetailsClient({ group }) {
  const openModal = useAuthModalStore((state) => state.openModal);
  const user = useSessionStore((s) => s.user);
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean)[0] ?? "";
  
  const gallery = group?.galleryImages?.length > 0 
    ? group.galleryImages 
    : [group?.coverUrl].filter(Boolean);
    
  const [activeMedia, setActiveMedia] = useState(gallery[0] || "");

  if (!group) return null;

  const isFree = group.pricingModel === "FREE";
  const joinText = isFree 
    ? "Join for free" 
    : `Join for $${Number(group.price).toFixed(0)}${group.billingInterval === "YEARLY" ? "/yr" : "/mo"}`;

  return (
    <div className="min-h-screen bg-ground pb-20">
      
      {/* Immersive Hero Cover */}
      <div className="w-full h-[320px] md:h-[400px] relative bg-ink border-b border-divider overflow-hidden">
        {activeMedia && (
          <MediaRenderer url={activeMedia} className="w-full h-full object-cover opacity-90" autoPlay={true} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Breadcrumb over cover */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-white/80 text-[13px] font-medium z-10">
          <span>Communities</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{group.name}</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1100px] mx-auto px-6 -mt-16 relative z-10 flex flex-col lg:flex-row gap-10">
        
        {/* Left Column (Main Info) */}
        <div className="flex-1">
          <div className="bg-surface rounded-2xl p-8 border border-divider shadow-soft mb-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-tight mb-3">{group.name}</h1>
                <p className="text-[16px] text-sand-700 leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {group.description}
                </p>
              </div>
              {group.iconUrl ? (
                <img src={group.iconUrl} className="w-16 h-16 rounded-xl border-2 border-surface shadow-md bg-surface shrink-0 object-cover" alt="Icon" />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-surface shadow-md bg-brand/10 shrink-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-brand">{group.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-divider text-[14px] text-sand-700 font-medium mb-8">
              <div className="flex items-center gap-2">
                {group.visibility === "PRIVATE" ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                {group.visibility === "PRIVATE" ? "Private" : "Public"}
              </div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {group.memberCount?.toLocaleString() ?? 0} Members</div>
              {group.owner && (
                <Link href={`/u/${group.owner.username || group.owner.id}`} target="_blank" className="ml-auto flex items-center gap-2 text-ink bg-sand-100 pr-3 pl-1 py-1 rounded-full text-xs font-bold hover:bg-sand-200 transition-colors no-underline">
                  {group.owner.avatarUrl ? (
                    <img src={group.owner.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-brand text-ground flex items-center justify-center text-[10px]">
                      {group.owner.firstName?.charAt(0)}
                    </div>
                  )}
                  By {group.owner.firstName} {group.owner.lastName}
                </Link>
              )}
            </div>

            {/* Gallery Mini-Selector */}
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                {gallery.map((mediaUrl, idx) => {
                  const isVideo = isVideoUrl(mediaUrl);
                  return (
                    <button 
                      key={idx} onClick={() => setActiveMedia(mediaUrl)}
                      className={`relative shrink-0 w-32 h-20 rounded-lg overflow-hidden transition-all bg-black ${activeMedia === mediaUrl ? 'ring-2 ring-brand opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <MediaRenderer url={mediaUrl} className="w-full h-full object-cover pointer-events-none" />
                      {isVideo && <PlayCircle className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-md pointer-events-none" />}
                    </button>
                  );
                })}
              </div>
            )}

            {(group.aboutContent || group.description) && (
              <>
                <h3 className="text-xl font-bold text-ink mb-4">About this community</h3>
                <div className="prose max-w-none text-[15px] leading-relaxed text-ink space-y-4 mb-2 whitespace-pre-wrap">
                  {group.aboutContent || group.description}
                </div>
              </>
            )}

          </div>
        </div>

        {/* Right Column (Sticky Join Card) */}
        <div className="w-full lg:w-[340px] shrink-0">
          <div className="sticky top-24 bg-surface rounded-2xl border border-divider shadow-lg p-6">
            <div className="text-[13px] font-bold text-sand-700 tracking-wider uppercase mb-1">Membership</div>
            <div className="text-3xl font-extrabold text-ink mb-2">
              {isFree ? "Free" : `$${Number(group.price).toFixed(0)}`}
              {!isFree && <span className="text-lg text-sand-700 font-medium">{group.billingInterval === "YEARLY" ? "/yr" : "/mo"}</span>}
            </div>
            
            {/* Show trial days if applicable */}
            {!isFree && group.trialDays > 0 && (
              <p className="text-[14px] text-brand-600 font-semibold mb-2">
                {group.trialDays}-day free trial
              </p>
            )}

            <p className="text-[14px] text-sand-700 font-medium mb-6">
              Cancel anytime. Instant access to all courses, community feeds, and daily coaching.
            </p>

            {user ? (
              <Link
                href={`/${slug}/join`}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 text-white font-bold text-[15px] rounded-xl transition-all flex items-center justify-center no-underline"
              >
                {joinText}
              </Link>
            ) : (
              <button
                onClick={() => openModal('signup')}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 text-white font-bold text-[15px] rounded-xl transition-all flex items-center justify-center"
              >
                {joinText}
              </button>
            )}
            
            <p className="text-center text-[12px] text-sand-700 font-medium mt-4">
              Secure checkout.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
