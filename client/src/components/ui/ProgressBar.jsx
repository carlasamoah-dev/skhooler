import { cn } from "@/lib/cn";

export default function ProgressBar({
  percent = 0,
  height = 8,
  track = "bg-sand-200",
  fill = "bg-brand",
  label,
  className,
}) {
  const value = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("w-full rounded-pill overflow-hidden", track, className)}
      style={{ height }}
    >
      <div className={cn("h-full rounded-pill transition-[width] duration-300", fill)} style={{ width: `${value}%` }} />
    </div>
  );
}
