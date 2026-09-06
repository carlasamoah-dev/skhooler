"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

/** The large Public/Private and Free/Paid choices. */
export default function RadioCard({ label, description, checked, onChange, name, value, className }) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "block cursor-pointer rounded-inner border p-4 transition-[background-color,color]",
        checked ? "border-brand bg-brand-50" : "border-divider bg-surface hover:border-sand-400",
        className,
      )}
    >
      <span className="flex items-start gap-3">
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={!!checked}
          onChange={() => onChange?.(value)}
          className="mt-1 w-4 h-4 accent-[var(--color-brand)]"
        />
        <span>
          <span className="block font-display font-extrabold text-ui text-ink">{label}</span>
          {description ? <span className="block mt-1 text-meta text-sand-700">{description}</span> : null}
        </span>
      </span>
    </label>
  );
}
