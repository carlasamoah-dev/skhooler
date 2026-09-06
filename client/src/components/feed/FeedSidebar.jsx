"use client";

import { useEffect, useState } from "react";

import { decideJoinRequest, fetchJoinRequests, fetchNextEvent, rsvpEvent } from "@/lib/api";
import { useCan } from "@/lib/permissions";
import GroupCard from "./GroupCard";
import JoinRequestsCard from "./JoinRequestsCard";
import NextEventCard from "./NextEventCard";

export default function FeedSidebar({ group }) {
  const can = useCan();
  const [requests, setRequests] = useState({ items: [], total: 0 });
  const [event, setEvent] = useState(null);
  const mayApprove = can("member:approve");

  useEffect(() => {
    let cancelled = false;
    fetchNextEvent().then((e) => !cancelled && setEvent(e));
    if (mayApprove) fetchJoinRequests().then((r) => !cancelled && setRequests(r));
    return () => {
      cancelled = true;
    };
  }, [mayApprove]);

  const decide = async (requestId) => {
    setRequests((r) => ({ items: r.items.filter((i) => i.id !== requestId), total: r.total - 1 }));
    await decideJoinRequest(requestId);
  };

  return (
    <aside className="flex flex-col gap-4">
      <GroupCard group={group} />
      {mayApprove ? (
        <JoinRequestsCard
          group={group}
          requests={requests.items}
          total={requests.total}
          onDecide={decide}
        />
      ) : null}
      <NextEventCard
        event={event}
        onRsvp={async (status) => {
          setEvent((e) => ({ ...e, myRsvp: status }));
          const result = await rsvpEvent(event.id, status);
          setEvent((e) => ({ ...e, ...result }));
        }}
      />
    </aside>
  );
}
