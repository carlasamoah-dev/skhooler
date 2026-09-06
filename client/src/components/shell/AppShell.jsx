"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

import { fetchNotifications } from "@/lib/api";
import { useGroupStore } from "@/store/useGroupStore";
import { useUiStore } from "@/store/useUiStore";
import { Skeleton } from "@/components/ui";
import NotificationPanel from "./NotificationPanel";
import PrimaryNav from "./PrimaryNav";
import TopBar from "./TopBar";

/** Which nav tab a route lights up. Post detail and the composer stay on the feed. */
function activeTabFrom(segments) {
  const first = segments[0];
  // Post detail and the composer live under the feed tab.
  if (first === "posts") return "feed";
  if (first === "classroom") return "class";
  if (first === "calendar") return "cal";
  if (first === "members") return "members";
  if (first === "dashboard") return "dash";
  if (first === "settings") return "settings";
  return "feed";
}

export default function AppShell({ slug, children }) {
  const segments = useSelectedLayoutSegments();
  const { group, user, status, error, hydrate } = useGroupStore();
  const { notifOpen, toggleNotifications, closeNotifications } = useUiStore();

  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState({ items: [], unreadCount: 0 });

  useEffect(() => {
    hydrate(slug);
  }, [slug, hydrate]);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications().then((data) => {
      if (!cancelled) setNotifications(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "error") {
    return (
      <div className="mx-auto max-w-[1180px] px-7 py-16">
        <h1>Could not load this group</h1>
        <p className="mt-2 text-body text-sand-800">{error}</p>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="mx-auto max-w-[1180px] px-7 py-5 flex flex-col gap-4">
        <Skeleton variant="row" />
        <Skeleton variant="row" />
        <Skeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <>
      <TopBar
        group={group}
        user={user}
        unreadCount={notifications.unreadCount}
        searchValue={search}
        onSearch={setSearch}
        onToggleNotifications={toggleNotifications}
      />

      <div className="mx-auto w-full max-w-[1180px] px-7 py-5">
        <div className="flex items-center gap-4 mb-4">
          <PrimaryNav slug={slug} active={activeTabFrom(segments)} />
          <Link
            href={`/${slug}`}
            className="btn btn-ghost hidden lg:inline-flex shrink-0 no-underline"
          >
            View public page
          </Link>
        </div>

        {children}
      </div>

      <NotificationPanel
        open={notifOpen}
        items={notifications.items}
        onMarkAllRead={() =>
          setNotifications((n) => ({
            ...n,
            unreadCount: 0,
            items: n.items.map((i) => ({ ...i, isRead: true })),
          }))
        }
        onClose={closeNotifications}
      />
    </>
  );
}
