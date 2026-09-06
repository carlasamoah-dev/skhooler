import { cn } from "@/lib/cn";

export default function Kicker({ as: Tag = "p", className, children }) {
  return <Tag className={cn("text-kicker font-bold text-sand-700", className)}>{children}</Tag>;
}
