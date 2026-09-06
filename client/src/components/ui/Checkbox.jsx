"use client";

import { useId } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export default function Checkbox({ label, checked, onChange, wrapped = false, id, className }) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-start gap-3 cursor-pointer text-ui",
        wrapped && "bg-sand-100 rounded-inner p-4",
        className,
      )}
    >
      <span className="relative flex items-center justify-center shrink-0 mt-px">
        <input
          id={inputId}
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer appearance-none w-5 h-5 rounded-[6px] border border-sand-400 bg-surface checked:bg-brand checked:border-brand transition-[background-color,color]"
        />
        <Check
          className="lucide absolute w-3.5 h-3.5 text-ground opacity-0 peer-checked:opacity-100 pointer-events-none"
          aria-hidden="true"
        />
      </span>
      <span>{label}</span>
    </label>
  );
}
