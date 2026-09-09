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
export default function Dialog({ open, onClose, title, width = 440, actions, hideClose = false, className, children }) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const downOnBackdropRef = useRef(false);

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
        downOnBackdropRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (downOnBackdropRef.current && e.target === e.currentTarget) onClose?.();
        downOnBackdropRef.current = false;
      }}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-ink/45 overflow-y-auto p-4 sm:p-6"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ width: `min(${width}px, 100%)` }}
        className={cn(
          "rise relative bg-surface rounded-overlay shadow-lg outline-none my-auto",
          "max-h-[calc(100dvh-2rem)] flex flex-col",
          className
        )}
      >
        {/* Fixed header */}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-3 p-6 pb-0 shrink-0">
            {title ? <h2 className="text-[22px] leading-snug pr-4">{title}</h2> : <div />}
            {hideClose ? null : (
              <IconButton
                icon={X}
                label="Close"
                variant="plain"
                size={34}
                onClick={onClose}
                className="shrink-0 -mt-1 -mr-1"
              />
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Fixed footer actions */}
        {actions ? (
          <div className="px-6 pb-6 pt-2 shrink-0 flex items-center gap-3 border-t border-divider">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
