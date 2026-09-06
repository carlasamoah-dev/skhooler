"use client";

import { cn } from "@/lib/cn";

const VARIANTS = {
  surface: "bg-surface shadow-soft hover:bg-sand-200",
  ghost: "text-brand-700 hover:bg-brand/10",
  plain: "hover:bg-ink/7",
};

/**
 * Icon-only control. `label` is required because there is no visible text to
 * name the button.
 */
export default function IconButton({
  icon: Icon,
  label,
  variant = "surface",
  size = 44,
  badge,
  className,
  ...props
}) {
  const showBadge = typeof badge === "number" && badge > 0;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full transition-[background-color,color]",
        "",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      <Icon className={cn("lucide", size >= 44 ? "w-[19px] h-[19px]" : "w-4 h-4")} aria-hidden="true" />
      {showBadge ? (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-alert text-ground font-display font-extrabold text-[11px] leading-5 text-center"
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </button>
  );
}
