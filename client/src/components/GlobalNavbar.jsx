"use client";

import Link from "next/link";
import { Moon, Search, Sun } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useThemeStore } from "@/store/useThemeStore";

export default function GlobalNavbar() {
  const openModal = useAuthModalStore((state) => state.openModal);
  const { searchQuery, setSearchQuery } = useSearchStore();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-surface border-b border-app-border flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-10">
        <Link href="/discover" className="text-xl font-extrabold tracking-tight text-app-fg hover:opacity-80 transition-opacity">
          skhooler
        </Link>

        {/* Integrated Search Bar */}
        <div className="hidden md:flex relative w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            aria-label="Search communities"
            className="w-full h-9 pl-9 pr-4 bg-surface-muted border border-transparent rounded-lg focus:bg-surface focus:border-app-border focus:outline-none focus:ring-4 focus:ring-app-border/40 transition-all text-[14px]"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Which icon shows is decided by CSS, not by state, so the server and
            client markup match no matter which theme the visitor has stored. */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle colour theme"
          className="p-2 rounded-lg text-muted-fg hover:text-app-fg hover:bg-surface-muted transition-colors"
        >
          <Moon className="w-4 h-4 dark:hidden" aria-hidden="true" />
          <Sun className="w-4 h-4 hidden dark:block" aria-hidden="true" />
        </button>
        <button
          onClick={() => openModal("login")}
          className="text-[14px] font-semibold text-muted-fg hover:text-app-fg transition-colors"
          suppressHydrationWarning
        >
          Sign in
        </button>
      </div>
    </nav>
  );
}
