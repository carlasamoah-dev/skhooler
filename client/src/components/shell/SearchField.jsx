"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/cn";

export default function SearchField({ value, onChange, placeholder = "Search", className }) {
  return (
    <div className={cn("relative w-full max-w-[420px]", className)}>
      <Search
        className="lucide absolute left-[15px] top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-sand-600 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-11 pl-10 pr-4 bg-surface text-ink text-ui rounded-pill border border-transparent hover:border-sand-400 focus-visible:border-brand placeholder:text-sand-600"
      />
    </div>
  );
}
