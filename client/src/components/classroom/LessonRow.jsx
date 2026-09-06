import Link from "next/link";

import { cn } from "@/lib/cn";

/** Status is stated in text for screen readers, never by the circle alone. */
const STATE_LABEL = { complete: "Completed", current: "Current lesson", todo: "Not started" };

export default function LessonRow({ lesson, state, badge, href }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={state === "current" ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-well no-underline text-ink",
          state === "current" ? "bg-brand-100" : "hover:bg-sand-100",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "w-[18px] h-[18px] rounded-full shrink-0",
            state === "complete" && "bg-sage",
            state === "current" && "bg-brand",
            state === "todo" && "border-2 border-dashed border-sand-400",
          )}
        />
        <span className="text-ui truncate">{lesson.title}</span>
        <span className="sr-only">{` — ${STATE_LABEL[state]}`}</span>
        {badge ? (
          <span className="ml-auto shrink-0 text-[11px] font-bold text-sand-700">{badge}</span>
        ) : null}
      </Link>
    </li>
  );
}
