import { cn } from "@/lib/cn";
import { avatarTint, initials } from "@/lib/format";

/** Font size steps chosen so initials stay optically centred at every size. */
const TEXT_FOR = (size) => {
  if (size >= 104) return "text-[34px]";
  if (size >= 52) return "text-[19px]";
  if (size >= 42) return "text-[15px]";
  if (size >= 32) return "text-[13px]";
  return "text-[11px]";
};

export default function Avatar({ name, src, size = 42, presence, className }) {
  const label = name || "Unknown";
  const dotSize = Math.max(8, Math.round(size * 0.26));

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars are remote and unsized
        <img
          src={src}
          alt={label}
          className="w-full h-full rounded-full object-cover"
          style={{ filter: "saturate(.85) contrast(.95)" }}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "w-full h-full rounded-full flex items-center justify-center font-display font-extrabold",
            TEXT_FOR(size),
            avatarTint(label),
          )}
        >
          {initials(label)}
        </span>
      )}
      {src ? null : <span className="sr-only">{label}</span>}
      {presence ? (
        <span
          title={presence === "online" ? "Online" : "Offline"}
          aria-label={presence === "online" ? "Online" : "Offline"}
          role="img"
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-ground",
            presence === "online" ? "bg-online" : "bg-sand-400",
          )}
          style={{ width: dotSize, height: dotSize }}
        />
      ) : null}
    </span>
  );
}
