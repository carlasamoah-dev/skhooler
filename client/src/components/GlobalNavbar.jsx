"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useSearchStore } from "@/store/useSearchStore";

export default function GlobalNavbar() {
  const openModal = useAuthModalStore((state) => state.openModal);
  const { searchQuery, setSearchQuery } = useSearchStore();

  return (
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-white border-b border-zinc-200 flex items-center justify-between px-6 shadow-sm">
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
            className="w-full h-9 pl-9 pr-4 bg-zinc-100 border border-transparent rounded-lg focus:bg-white focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all text-[14px]"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => openModal('login')}
          className="text-[14px] font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          suppressHydrationWarning
        >
          Sign in
        </button>
      </div>
    </nav>
  );
}
