"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Avatar, IconButton } from "@/components/ui";
import SearchField from "./SearchField";

export default function TopBar({ group, user, unreadCount = 0, searchValue, onSearch, onToggleNotifications }) {
  const groupName = group?.name ?? "";
  const userName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header className="sticky top-0 z-40 bg-ground border-b border-divider">
      <div className="mx-auto max-w-[1180px] px-7 py-4 flex items-center gap-4">
        <Link href={`/${group?.slug ?? ""}/community`} className="flex items-center gap-3 min-w-0 no-underline">
          {group?.iconUrl ? (
            <Avatar name={groupName} src={group.iconUrl} size={40} />
          ) : (
            <span
              aria-hidden="true"
              className="w-10 h-10 rounded-full bg-brand text-ground flex items-center justify-center font-display font-extrabold text-ui shrink-0"
            >
              {groupName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="font-display font-extrabold text-[21px] tracking-[-0.02em] text-ink truncate">
            {groupName}
          </span>
        </Link>

        <SearchField
          value={searchValue}
          onChange={onSearch}
          placeholder="Search posts, lessons and people"
          className="ml-2 hidden md:block"
        />

        <div className="ml-auto flex items-center gap-3">
          <IconButton
            icon={Bell}
            label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            badge={unreadCount}
            onClick={onToggleNotifications}
          />
          <Avatar name={userName} src={user?.avatarUrl ?? undefined} size={44} />
        </div>
      </div>
    </header>
  );
}
