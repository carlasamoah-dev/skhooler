import { cn } from "@/lib/cn";

const TONE = {
  brand: "bg-brand",
  sage: "bg-sage",
  neutral: "bg-sand-400",
  online: "bg-online",
};

/**
 * Categorical marker: category, role, tier, access. The label always renders,
 * so the meaning never rests on colour alone.
 */
export default function StatusDot({ tone = "neutral", label, className }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden="true" className={cn("w-[7px] h-[7px] rounded-full shrink-0", TONE[tone])} />
      <span className="text-kicker font-bold text-sand-700">{label}</span>
    </span>
  );
}
