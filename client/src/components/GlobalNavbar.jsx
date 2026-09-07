"use client";

import Link from "next/link";
import { Search, Bell, LogOut } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useUiStore } from "@/store/useUiStore";
import { Avatar, IconButton } from "@/components/ui";

export default function GlobalNavbar() {
  const openModal = useAuthModalStore((state) => state.openModal);
  const { searchQuery, setSearchQuery } = useSearchStore();
  
  const user = useSessionStore((s) => s.user);
  const signOut = useSessionStore((s) => s.signOut);
  const toggleNotifications = useUiStore((s) => s.toggleNotifications);

  const userName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-white border-b border-zinc-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-10">
        <Link href="/discover" className="text-xl font-extrabold tracking-tight text-zinc-900 hover:opacity-80 transition-opacity">
          skhooler
        </Link>

        {/* Integrated Search Bar */}
        <div className="hidden md:flex relative w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            aria-label="Search communities"
            className="w-full h-9 pl-9 pr-4 bg-zinc-100 border border-transparent rounded-lg focus:bg-white focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all text-[14px]"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <IconButton
              icon={Bell}
              label="Notifications"
              badge={0}
              onClick={toggleNotifications}
            />
            <Avatar name={userName} src={user.avatarUrl} size={36} />
            <IconButton icon={LogOut} label="Log out" variant="plain" size={36} onClick={signOut} />
          </>
        ) : (
          <button
            onClick={() => openModal("login")}
            className="text-[14px] font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            suppressHydrationWarning
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

