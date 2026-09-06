import { cn } from "@/lib/cn";

const VARIANTS = {
  card: "h-[168px] rounded-card",
  row: "h-[64px] rounded-inner",
  text: "h-3.5 rounded-pill",
  circle: "w-[42px] h-[42px] rounded-full",
};

export default function Skeleton({ variant = "text", count = 1, className }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={cn("bg-sand-200 animate-pulse", VARIANTS[variant], className)}
        />
      ))}
    </>
  );
}
