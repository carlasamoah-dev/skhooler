"use client";

import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";

export const TABS = [
  { value: "all", label: "All", countKey: "all" },
  { value: "admins", label: "Admins", countKey: "admins" },
  { value: "mods", label: "Moderators", countKey: "moderators" },
  { value: "members", label: "Members", countKey: "members" },
  { value: "pending", label: "Requests", countKey: "pendingRequests" },
  { value: "map", label: "Map" },
];

export default function MemberTabs({ value, counts = {}, onChange }) {
  return (
    <div role="tablist" aria-label="Member views" className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = tab.value === value;
        const count = tab.countKey ? counts[tab.countKey] : null;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(tab.value)}
            className={cn("btn", active ? "bg-brand text-ground" : "bg-surface text-ink")}
          >
            {tab.label}
            {count != null ? <span className="font-normal opacity-80">{formatCount(count)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
