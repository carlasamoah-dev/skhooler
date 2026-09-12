"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Avatar, IconButton } from "@/components/ui";

export default function CommunityNavbar({ group }) {
  const openModal = useAuthModalStore((state) => state.openModal);
  const user = useSessionStore((s) => s.user);
  const signOut = useSessionStore((s) => s.signOut);
  const userName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <nav className="sticky top-0 z-50 w-full h-[60px] bg-surface border-b border-divider flex items-center justify-between px-4 sm:px-6 shadow-soft">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group no-underline">
          {group?.iconUrl ? (
            <img src={group.iconUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-lg shadow-soft">
              {group?.name?.charAt(0) || "C"}
            </div>
          )}
          <span className="text-[17px] font-bold text-ink group-hover:text-brand-700 transition-colors">{group?.name || "Community"}</span>
        </Link>
        <div className="flex flex-col justify-center -space-y-1 ml-1 cursor-pointer">
          <svg className="w-[10px] h-[10px] text-sand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path></svg>
          <svg className="w-[10px] h-[10px] text-sand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Avatar name={userName} src={user.avatarUrl} size={34} />
            <IconButton icon={LogOut} label="Log out" variant="plain" size={34} onClick={signOut} />
          </>
        ) : (
          <button
            onClick={() => openModal('login')}
            className="btn btn-primary text-[13px]"
          >
            Log in
          </button>
        )}
      </div>
    </nav>
  );
}
