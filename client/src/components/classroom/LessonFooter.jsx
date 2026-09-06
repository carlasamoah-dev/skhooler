"use client";

import Link from "next/link";

import { formatDuration } from "@/lib/format";
import { Button, Checkbox } from "@/components/ui";

export default function LessonFooter({
  isCompleted,
  onToggleComplete,
  lastPositionSeconds,
  previousHref,
  nextHref,
}) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-4">
      <Checkbox label="Mark complete" checked={isCompleted} onChange={onToggleComplete} />

      {lastPositionSeconds > 0 && !isCompleted ? (
        <span className="text-meta text-sand-700">{`Resumes at ${formatDuration(lastPositionSeconds)}`}</span>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        {previousHref ? (
          <Link href={previousHref} className="btn btn-secondary no-underline">
            Previous
          </Link>
        ) : (
          <Button variant="secondary" disabled>
            Previous
          </Button>
        )}
        {nextHref ? (
          <Link href={nextHref} className="btn btn-primary no-underline">
            Next lesson
          </Link>
        ) : (
          <Button disabled>Next lesson</Button>
        )}
      </div>
    </div>
  );
}
