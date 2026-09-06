"use client";

import Link from "next/link";

import { formatCount } from "@/lib/format";
import { useCan } from "@/lib/permissions";
import { Card } from "@/components/ui";

export default function GroupCard({ group }) {
  const can = useCan();
  const stats = group?.stats ?? {};

  return (
    <Card padding={18} radius="panel" className="overflow-hidden p-0">
      {/* Banner slot: 1084x300. No asset yet, so it renders as a brand field. */}
      <div className="aspect-[1084/300] w-full bg-brand" aria-hidden="true" />

      <div className="p-[22px]">
        <h4>{group.name}</h4>
        <p className="text-meta text-sand-700">{`skhooler.com/${group.slug}`}</p>
        <p className="mt-2 text-body text-sand-800">{group.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-ui">
          <span>{`${formatCount(stats.memberCount)} members`}</span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-online" />
            {`${formatCount(stats.onlineCount)} online`}
          </span>
          <span>{`${stats.adminCount} admins`}</span>
        </div>

        {can("group:settings") ? (
          <Link
            href={`/${group.slug}/settings/general`}
            className="btn btn-secondary w-full justify-center mt-5 no-underline"
          >
            Group settings
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
