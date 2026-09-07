"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { Avatar } from "@/components/ui";

// Mock joined communities for the rail
const MOCK_JOINED_COMMUNITIES = [
  {
    slug: "remote-jobs-hq",
    name: "Remote Jobs HQ",
    iconUrl: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=128&h=128&fit=crop",
  },
  {
    slug: "maker-school",
    name: "Maker School",
    iconUrl: null, // Will fallback to 'M'
  }
];

export default function NavigationRail() {
  const user = useSessionStore((s) => s.user);
  const pathname = usePathname();

  if (!user) return null;

  const isDiscover = pathname.startsWith("/discover");

  return (
    <aside className="w-[72px] shrink-0 bg-surface border-r border-divider h-screen flex flex-col items-center py-4 gap-3 z-50">
      {/* Discover Button */}
      <Link
        href="/discover"
        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
          isDiscover 
            ? "bg-zinc-200 text-ink shadow-inner" 
            : "bg-surface text-sand-500 hover:bg-zinc-100 hover:text-ink"
        }`}
        title="Discover"
      >
        <Compass className="w-6 h-6 stroke-[2px]" />
      </Link>

      <div className="w-8 h-[2px] bg-divider rounded-full my-1" />

      {/* Communities */}
      {MOCK_JOINED_COMMUNITIES.map((community) => {
        const isActive = pathname.startsWith(`/${community.slug}`);
        return (
          <Link
            key={community.slug}
            href={`/${community.slug}/community`}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all relative overflow-hidden ${
              isActive ? "ring-2 ring-ink ring-offset-2" : "hover:ring-2 hover:ring-sand-300 hover:ring-offset-2"
            }`}
            title={community.name}
          >
            {community.iconUrl ? (
              <img src={community.iconUrl} alt={community.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand text-ground flex items-center justify-center font-display font-bold text-lg">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        );
      })}
    </aside>
  );
}
