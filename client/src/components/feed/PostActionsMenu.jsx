"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, MessageSquareOff, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { deletePost, togglePostComments } from "@/lib/api";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";

/**
 * Three-dot actions menu shown on a post detail.
 *
 * Roles:
 *  - Moderator/Admin/Owner → Edit, Copy link, Turn off/on comments, Delete
 *  - Member                → Copy link only
 */
export default function PostActionsMenu({ post, onPostChanged, onDeleted }) {
  const can = useCan();
  const { slug } = useGroupStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef(null);

  const canManage = can("post:delete"); // Moderator+

  // Close on click-outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const copyLink = async () => {
    const url = `${window.location.origin}/${slug}/posts/${post.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This can't be undone.")) return;
    setBusy(true);
    try {
      await deletePost(post.id);
      setOpen(false);
      onDeleted?.();
      router.push(`/${slug}/community`);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleComments = async () => {
    setBusy(true);
    try {
      const result = await togglePostComments(post.id);
      onPostChanged?.({ commentsEnabled: result.commentsEnabled });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Post actions"
        aria-expanded={open}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-sand-500 hover:text-ink hover:bg-sand-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-52 bg-surface border border-divider rounded-panel shadow-lg py-1 overflow-hidden"
          role="menu"
        >
          {/* Moderator / Admin / Owner actions */}
          {canManage && (
            <>
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  router.push(`/${slug}/posts/new?edit=${post.id}`);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-ink hover:bg-sand-100 transition-colors text-left"
              >
                <Pencil className="w-4 h-4 text-sand-500" />
                Edit post
              </button>

              <button
                role="menuitem"
                onClick={handleToggleComments}
                disabled={busy}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-ink hover:bg-sand-100 transition-colors text-left disabled:opacity-50"
              >
                {post.commentsEnabled !== false ? (
                  <>
                    <MessageSquareOff className="w-4 h-4 text-sand-500" />
                    Turn off comments
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-sand-500" />
                    Turn on comments
                  </>
                )}
              </button>
            </>
          )}

          {/* Available to all roles */}
          <button
            role="menuitem"
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-ink hover:bg-sand-100 transition-colors text-left"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-sage-500" />Copied!</>
            ) : (
              <><Copy className="w-4 h-4 text-sand-500" />Copy link</>
            )}
          </button>

          {/* Delete — destructive, separated visually */}
          {canManage && (
            <>
              <div className="my-1 border-t border-divider" />
              <button
                role="menuitem"
                onClick={handleDelete}
                disabled={busy}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-alert hover:bg-sand-100 transition-colors text-left disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete post
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
