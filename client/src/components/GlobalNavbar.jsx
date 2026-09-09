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
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-surface border-b border-divider flex items-center justify-between px-6">
      <div className="flex items-center gap-10">
        <Link href="/discover" className="font-display font-extrabold text-xl text-ink tracking-tight hover:opacity-80 transition-opacity no-underline">
          skhooler
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex relative w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            aria-label="Search communities"
            className="w-full h-9 pl-9 pr-4 bg-sand-100 border border-transparent rounded-lg focus:bg-ground focus:border-divider focus:outline-none transition-all text-[14px] text-ink placeholder:text-sand-500"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/create"
              className="hidden md:inline-flex items-center h-8 px-4 text-[13px] font-bold text-ink border border-divider rounded-lg hover:bg-sand-100 transition-colors no-underline"
            >
              + Create
            </Link>
            <IconButton icon={Bell} label="Notifications" badge={0} onClick={toggleNotifications} />
            <Link href="/account" className="flex shrink-0">
              <Avatar name={userName} src={user.avatarUrl} size={34} />
            </Link>
            <IconButton icon={LogOut} label="Log out" variant="plain" size={34} onClick={signOut} />
          </>
        ) : (
          <button
            onClick={() => openModal("login")}
            className="btn btn-primary text-[13px]"
            suppressHydrationWarning
          >
            Log in
          </button>
        )}
      </div>
    </nav>
  );
}

