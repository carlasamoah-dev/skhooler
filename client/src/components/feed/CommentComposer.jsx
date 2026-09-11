"use client";

import { useState, useRef, useEffect } from "react";

import { Avatar, Button } from "@/components/ui";

export default function CommentComposer({ user, onSubmit, onTyping, placeholder = "Add a comment…", size = 40 }) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const name = user ? `${user.firstName} ${user.lastName}` : "";
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = (newContent) => {
    setContent(newContent);
    if (!isTyping && newContent.length > 0) {
      setIsTyping(true);
      onTyping?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (newContent.length === 0) {
      setIsTyping(false);
      onTyping?.(false);
    } else {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) onTyping?.(false);
    };
  }, [isTyping, onTyping]);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    
    // Stop typing immediately when submitted
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    onTyping?.(false);

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
        onChange={(e) => handleTyping(e.target.value)}
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
