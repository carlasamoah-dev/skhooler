"use client";

import { CalendarPlus } from "lucide-react";

import { cn } from "@/lib/cn";
import { LOCATION_LABEL, describeRecurrence, downloadIcs, formatEventTime, zonedParts } from "@/lib/calendar";
import { Card, Tag } from "@/components/ui";
import RsvpGroup from "./RsvpGroup";

export default function EventRow({ event, tier, canRsvp, onRsvp }) {
  const parts = zonedParts(event.startDate, event.timezone);
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: event.timezone })
    .format(new Date(event.startDate))
    .toUpperCase();

  const access = event.accessType === "TIER_LOCKED" ? (tier?.name ?? "Tier only") : "all members";
  const meta = [formatEventTime(event), LOCATION_LABEL[event.locationType] ?? "Online link", access].join(" · ");

  return (
    <Card as="article" padding={18} radius="card" className="px-6 py-[18px] flex flex-wrap items-center gap-4">
      <div className="w-[58px] h-[58px] shrink-0 rounded-well bg-brand-100 grid place-content-center text-center">
        <span className="block text-[11px] font-extrabold text-brand-800">{monthLabel}</span>
        <span className="block font-display font-extrabold text-xl leading-none">{parts.day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h4 className={cn("text-lg", event.isCancelled && "line-through")}>{event.title}</h4>
        <p className="text-meta text-sand-700">{meta}</p>
        {event.isRecurring ? (
          <p className="text-meta text-sand-700">{describeRecurrence(event)}</p>
        ) : null}
        {event.isCancelled ? <Tag tone="brand" className="mt-1">Cancelled</Tag> : null}
      </div>

      <p className="text-meta font-semibold shrink-0">{`${event.attendeeCount} going`}</p>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <RsvpGroup
          value={event.myRsvp}
          onChange={(status) => onRsvp?.(event, status)}
          size="sm"
          disabled={!canRsvp || event.isCancelled}
          disabledReason={
            event.isCancelled
              ? "This event was cancelled"
              : `This event is for the ${tier?.name ?? "locked"} tier`
          }
        />
        <button type="button" onClick={() => downloadIcs(event)} className="btn btn-ghost">
          <CalendarPlus className="lucide w-4 h-4" aria-hidden="true" />
          Add to calendar
        </button>
      </div>
    </Card>
  );
}
