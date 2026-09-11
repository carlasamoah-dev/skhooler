"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { Avatar } from "@/components/ui";

export default function NavigationRail() {
  const { user, communities } = useSessionStore();
  const pathname = usePathname();

  if (!user) return null;

  const isDiscover = pathname.startsWith("/discover");

  return (
    <aside className="fixed bottom-0 left-0 right-0 h-16 md:h-screen md:static md:w-[72px] shrink-0 bg-surface border-t md:border-t-0 md:border-r border-divider flex flex-row md:flex-col items-center justify-center md:justify-start px-4 py-0 md:py-4 md:px-0 gap-3 md:gap-3 z-50 overflow-x-auto md:overflow-y-auto overflow-y-hidden md:overflow-x-hidden">
      {/* Discover Button */}
      <Link
        href="/discover"
        className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
          isDiscover 
            ? "bg-sand-200 text-ink shadow-inner" 
            : "bg-surface text-sand-500 hover:bg-sand-100 hover:text-ink"
        }`}
        title="Discover"
      >
        <Compass className="w-6 h-6 stroke-[2px]" />
      </Link>

      <div className="w-[2px] h-8 md:w-8 md:h-[2px] bg-divider rounded-full mx-1 md:mx-0 md:my-1 shrink-0" />

      {/* Communities */}
      {communities.map((community) => {
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
