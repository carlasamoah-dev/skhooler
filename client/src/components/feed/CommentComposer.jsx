"use client";

import { useState } from "react";

import { Avatar, Button } from "@/components/ui";

export default function CommentComposer({ user, onSubmit, placeholder = "Add a comment…", size = 40 }) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const name = user ? `${user.firstName} ${user.lastName}` : "";

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSubmit?.(trimmed);
      setContent("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <Avatar name={name} src={user?.avatarUrl ?? undefined} size={size} />
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input flex-1"
      />
      <Button type="submit" disabled={!content.trim()} loading={busy} className="shrink-0">
        Reply
      </Button>
    </form>
  );
}
