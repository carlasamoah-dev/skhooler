"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

import { fetchNotifications } from "@/lib/api";
import { useGroupStore } from "@/store/useGroupStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useUiStore } from "@/store/useUiStore";
import { useSocketStore } from "@/store/useSocketStore";
import { Skeleton } from "@/components/ui";
import NotificationPanel from "./NotificationPanel";
import PrimaryNav from "./PrimaryNav";
import TopBar from "./TopBar";
import ComposerModal from "@/components/feed/ComposerModal";

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
  const { group, status, error, hydrate } = useGroupStore();
  const { notifOpen, toggleNotifications, closeNotifications } = useUiStore();
  const user = useSessionStore((s) => s.user);
  const signOut = useSessionStore((s) => s.signOut);
  const { connect, disconnect, joinGroup, leaveGroup, isConnected, socket } = useSocketStore();

  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState({ items: [], unreadCount: 0 });

  useEffect(() => {
    hydrate(slug);
  }, [slug, hydrate]);

  // Handle Socket Connection
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (status === "ready" && group?.id) {
      joinGroup(group.id);
    }
    return () => {
      if (group?.id) leaveGroup(group.id);
    };
  }, [status, group?.id, joinGroup, leaveGroup]);

  // Handle Socket Events
  useEffect(() => {
    const { socket, isConnected } = useSocketStore.getState();
    if (!socket || !isConnected) return;

    const onPostUpdated = ({ postId, patch }) => {
      // Lazy load feed store
      import("@/store/useFeedStore").then(({ useFeedStore }) => {
        useFeedStore.getState().updatePost(postId, patch);
      });
    };

    const onPostCreated = ({ post }) => {
      import("@/store/useFeedStore").then(({ useFeedStore }) => {
        useFeedStore.getState().addPost(post);
      });
    };

    socket.on("post:updated", onPostUpdated);
    socket.on("post:created", onPostCreated);

    return () => {
      socket.off("post:updated", onPostUpdated);
      socket.off("post:created", onPostCreated);
    };
  }, [socket, isConnected]); 

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
        onSignOut={signOut}
      />

      <div className="flex-1 overflow-y-auto">
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
      <ComposerModal />
    </>
  );
}
