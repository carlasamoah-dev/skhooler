import { cn } from "@/lib/cn";

const TONE = {
  brand: "bg-brand-100 text-brand-800",
  sage: "bg-sage-100 text-sage-900",
  neutral: "bg-sand-200 text-sand-900",
  outline: "border border-divider text-sand-800",
};

export default function Tag({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-pill text-kicker font-bold",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
