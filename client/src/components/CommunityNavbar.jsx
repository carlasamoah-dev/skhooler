"use client";

import Link from "next/link";
import { useAuthModalStore } from "@/store/useAuthModalStore";

export default function CommunityNavbar() {
  const openModal = useAuthModalStore((state) => state.openModal);

  return (
    <nav className="sticky top-0 z-50 w-full h-[60px] bg-surface border-b border-app-border flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-primary text-on-brand flex items-center justify-center font-serif text-[10px] leading-tight text-center italic font-bold shadow-sm">
            Maker<br/>School.
          </div>
          <span className="text-[17px] font-bold text-app-fg group-hover:text-brand-primary transition-colors">Maker School: AI Automation</span>
        </Link>
        <div className="flex flex-col justify-center -space-y-1 ml-1 cursor-pointer">
          <svg className="w-[10px] h-[10px] text-muted-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path></svg>
          <svg className="w-[10px] h-[10px] text-muted-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => openModal('login')}
          className="text-[13px] font-bold text-app-fg hover:text-brand-accent hover:border-brand-accent border border-app-border rounded-md px-5 py-2 transition-all shadow-sm"
        >
          LOG IN
        </button>
      </div>
    </nav>
  );
}
