"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import IconButton from "./IconButton";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog: traps focus while open, closes on Escape or a backdrop click,
 * and restores focus to whatever opened it.
 */
export default function Dialog({ open, onClose, title, width = 440, actions, className, children }) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;

      const items = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;

    returnFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const items = panelRef.current?.querySelectorAll(FOCUSABLE);
    (items && items.length > 0 ? items[0] : panelRef.current)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/45 p-4"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ width: `min(${width}px, 100%)` }}
        className={cn("rise relative bg-surface rounded-overlay shadow-lg p-9 outline-none", className)}
      >
        <IconButton
          icon={X}
          label="Close"
          variant="plain"
          size={36}
          onClick={onClose}
          className="absolute top-4 right-4"
        />
        {title ? <h2 className="text-[26px] pr-10">{title}</h2> : null}
        {children}
        {actions ? <div className="mt-7 flex items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
