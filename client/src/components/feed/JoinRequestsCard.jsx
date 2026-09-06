"use client";

import Link from "next/link";

import { relativeTime } from "@/lib/format";
import { Avatar, Button, Card } from "@/components/ui";

/** Hidden when approval is automatic or the queue is empty. */
export default function JoinRequestsCard({ group, requests = [], total = 0, onDecide }) {
  if (group?.joinApproval === "AUTOMATIC" || requests.length === 0) return null;

  return (
    <Card padding={18} radius="panel" className="p-[22px]">
      <h4 className="text-[17px]">Join requests</h4>
      <p className="text-meta text-sand-700">
        {`${total} pending · ${group?.joinApproval === "MANUAL" ? "manual" : "automatic"} approval`}
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {requests.slice(0, 3).map((request) => {
          const name = `${request.user.firstName} ${request.user.lastName}`;
          return (
            <li key={request.id} className="flex items-center gap-3">
              <Avatar name={name} src={request.user.avatarUrl ?? undefined} size={32} />
              <div className="min-w-0">
                <p className="text-ui font-semibold truncate">{name}</p>
                <p className="text-meta text-sand-700 whitespace-nowrap">{`requested ${relativeTime(request.createdAt)}`}</p>
              </div>
              <div className="ml-auto flex items-center gap-0.5 shrink-0">
                <Button variant="ghost" size="sm" className="px-2" onClick={() => onDecide?.(request.id, "decline")}>
                  Decline
                </Button>
                <Button size="sm" className="px-3" onClick={() => onDecide?.(request.id, "approve")}>
                  Approve
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <Link href={`/${group.slug}/members?tab=pending`} className="btn btn-ghost mt-4 no-underline">
        See all requests
      </Link>
    </Card>
  );
}
