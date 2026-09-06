import { Pin } from "lucide-react";

import { relativeTime } from "@/lib/format";
import { Avatar, StatusDot } from "@/components/ui";

export default function PostHeader({ author, createdAt, category, isPinned, size = 42, showRole = false }) {
  const name = `${author.firstName} ${author.lastName}`;

  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} src={author.avatarUrl ?? undefined} size={size} />
      <div className="min-w-0">
        <p className="text-ui">
          <span className="font-semibold">{name}</span>
          {showRole && author.role ? (
            <span className="text-sand-700">{` · ${author.role[0]}${author.role.slice(1).toLowerCase()}`}</span>
          ) : null}
          <span className="text-sand-700">{` · ${relativeTime(createdAt)}`}</span>
        </p>
        {category ? <StatusDot tone="brand" label={category.name} className="mt-0.5" /> : null}
      </div>
      {isPinned ? (
        <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 text-brand-700 text-kicker font-bold">
          <Pin className="lucide w-3.5 h-3.5" aria-hidden="true" />
          Pinned
        </span>
      ) : null}
    </div>
  );
}
