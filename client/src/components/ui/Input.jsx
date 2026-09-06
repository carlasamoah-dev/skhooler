"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

export default function Input({
  label,
  error,
  hint,
  leadingIcon: Icon,
  id,
  className,
  ...props
}) {
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
      <div className="relative">
        {Icon ? (
          <Icon
            className="lucide absolute left-[15px] top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-sand-600 pointer-events-none"
            aria-hidden="true"
          />
        ) : null}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn("input", Icon && "pl-10", error && "border-alert", className)}
          {...props}
        />
      </div>
      {/* Reserved so an error appearing does not shift the layout. */}
      {error || hint ? (
        <p
          id={messageId}
          className={cn("mt-1.5 text-meta min-h-[18px]", error ? "text-alert" : "text-sand-700")}
        >
          {error || hint}
        </p>
      ) : null}
    </div>
  );
}
