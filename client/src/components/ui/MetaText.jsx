import { cn } from "@/lib/cn";

/** The app's default secondary line. */
export default function MetaText({ as: Tag = "p", className, children }) {
  return <Tag className={cn("text-meta text-sand-700", className)}>{children}</Tag>;
}
