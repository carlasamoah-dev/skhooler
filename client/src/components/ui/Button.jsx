"use client";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/cn";

const button = cva("btn", {
  variants: {
    variant: { primary: "btn-primary", secondary: "btn-secondary", ghost: "btn-ghost" },
    size: { sm: "px-3 py-1.5 text-meta", md: "" },
    block: { true: "w-full justify-center", false: "" },
  },
  defaultVariants: { variant: "primary", size: "md", block: false },
});

export default function Button({
  variant,
  size,
  block,
  icon: Icon,
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(button({ variant, size, block }), className)}
      {...props}
    >
      {Icon ? <Icon className="lucide w-4 h-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
