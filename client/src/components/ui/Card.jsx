import { cn } from "@/lib/cn";

const PADDING = { 18: "p-[18px]", 22: "p-[22px]", 24: "p-6", 32: "p-8" };
const RADIUS = { card: "rounded-card", panel: "rounded-panel", overlay: "rounded-overlay" };
const ELEVATION = { soft: "shadow-soft", md: "shadow-md", lg: "shadow-lg", none: "" };
const TINT = { surface: "bg-surface", sage: "bg-sage-100", brand: "bg-brand text-ground" };

export default function Card({
  as: Tag = "div",
  padding = 24,
  radius = "card",
  elevation = "soft",
  tint = "surface",
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(TINT[tint], PADDING[padding], RADIUS[radius], ELEVATION[elevation], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
