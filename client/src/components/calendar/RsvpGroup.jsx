"use client";

import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "GOING", label: "Going" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NOT_GOING", label: "Not going" },
];

export default function RsvpGroup({ value, onChange, disabled = false, disabledReason, size = "md" }) {
  return (
    <div role="group" aria-label="RSVP" className="flex flex-wrap gap-1.5">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            title={disabled ? disabledReason : undefined}
            // Clicking the selected option clears it, so an RSVP can be withdrawn.
            onClick={() => onChange?.(selected ? null : option.value)}
            className={cn(
              "btn",
              size === "sm" && "px-3 py-1.5 text-meta",
              selected ? "bg-brand text-ground" : "bg-sand-200 text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
