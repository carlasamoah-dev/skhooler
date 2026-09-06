"use client";

import { cn } from "@/lib/cn";

export default function CategoryFilter({ categories = [], activeId = null, onChange }) {
  const options = [{ id: null, name: "All" }, ...categories];

  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <button
            key={option.id ?? "all"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(option.id)}
            className={cn("btn", active ? "bg-ink text-ground" : "btn-ghost")}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
