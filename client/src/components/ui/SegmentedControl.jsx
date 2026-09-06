"use client";

import { cn } from "@/lib/cn";

/**
 * Owns the sliding brand indicator. The indicator is one absolutely positioned
 * element sized to a single column and translated by whole columns, so the
 * movement is a transform rather than a layout change.
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  orientation = "horizontal",
  columns,
  label,
  renderItem,
  className,
}) {
  const count = columns ?? options.length;
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const vertical = orientation === "vertical";

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      className={cn(
        "relative bg-surface p-1 rounded-[10px]",
        vertical ? "flex flex-col" : "grid",
        className,
      )}
      style={vertical ? undefined : { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute rounded-[8px] bg-brand pointer-events-none"
        style={
          vertical
            ? {
                left: 4,
                right: 4,
                top: 4,
                height: `calc((100% - 8px) / ${count})`,
                transform: `translateY(calc(${activeIndex} * 100%))`,
                transition: "transform .22s cubic-bezier(.4,0,.2,1)",
              }
            : {
                top: 4,
                bottom: 4,
                left: 4,
                width: `calc((100% - 8px) / ${count})`,
                transform: `translateX(calc(${activeIndex} * 100%))`,
                transition: "transform .22s cubic-bezier(.4,0,.2,1)",
              }
        }
      />
      {options.map((option, index) => {
        const active = index === activeIndex;
        const content = renderItem ? renderItem(option, active) : option.label;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(option.value)}
            className={cn(
              "relative z-10 px-3 py-2 rounded-[8px] text-ui font-semibold text-center",
              "transition-[background-color,color] duration-[.18s]",
              "",
              active ? "text-ground" : "text-sand-800 hover:text-ink",
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
