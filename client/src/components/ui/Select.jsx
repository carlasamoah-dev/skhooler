"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

export default function Select({
  label,
  options = [],
  value,
  onChange,
  size = "md",
  id,
  className,
  ...props
}) {
  const generated = useId();
  const selectId = id ?? generated;

  return (
    <div className={cn(size === "sm" ? "inline-block" : "w-full")}>
      {label ? (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "appearance-none w-full bg-sand-100 text-ink font-sans text-ui",
            "border border-transparent rounded-pill pl-4 pr-9",
            "hover:border-sand-400 focus-visible:border-brand",
            size === "sm" ? "h-[38px]" : "min-h-[46px]",
            className,
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="lucide absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-600 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
