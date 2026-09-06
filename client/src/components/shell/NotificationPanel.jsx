"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button, IconButton } from "@/components/ui";
import NotificationRow from "./NotificationRow";

export default function NotificationPanel({ open, items = [], onMarkAllRead, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    // Any click outside the panel dismisses it, including on the bell, which
    // then re-opens it on its own click handler.
    const onPointerDown = (e) => {
      if (!panelRef.current?.contains(e.target)) onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="rise fixed top-20 right-7 z-50 w-[410px] max-w-[calc(100vw-2rem)] bg-surface rounded-overlay shadow-lg p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-card-title">Notifications</h3>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onMarkAllRead}>
          Mark all read
        </Button>
        <IconButton icon={X} label="Close notifications" variant="plain" size={36} onClick={onClose} />
      </div>

      <ul className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
        {items.map((item) => (
          <NotificationRow key={item.id} item={item} />
        ))}
      </ul>

      <a
        href="#"
        className="block mt-3 pt-3 border-t border-divider text-ui font-semibold text-center"
      >
        View all notifications
      </a>
    </div>
  );
}
