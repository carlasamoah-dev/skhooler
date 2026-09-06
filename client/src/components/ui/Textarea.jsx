"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

export default function Textarea({ label, error, rows = 5, id, className, ...props }) {
  const generated = useId();
  const inputId = id ?? generated;
  const messageId = `${inputId}-message`;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        className={cn("input", error && "border-alert", className)}
        {...props}
      />
      {error ? (
        <p id={messageId} className="mt-1.5 text-meta text-alert min-h-[18px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
