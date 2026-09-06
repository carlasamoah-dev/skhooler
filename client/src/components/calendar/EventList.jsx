"use client";

import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/ui";
import EventRow from "./EventRow";

export default function EventList({ events = [], tiers = [], myTierId, canRsvpAll, onRsvp, filter }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={filter === "past" ? "No past events" : "No events this month"}
        body={filter === "past" ? "Events move here once they have happened." : "Nothing scheduled yet."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => {
        const tier = tiers.find((t) => t.id === event.requiredTierId);
        // A tier-locked event is only RSVP-able by someone holding that tier.
        const canRsvp =
          canRsvpAll ||
          event.accessType !== "TIER_LOCKED" ||
          (myTierId && myTierId === event.requiredTierId);

        return <EventRow key={event.id} event={event} tier={tier} canRsvp={canRsvp} onRsvp={onRsvp} />;
      })}
    </div>
  );
}
