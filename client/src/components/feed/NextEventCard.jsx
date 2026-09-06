"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui";

const RSVPS = [
  { value: "GOING", label: "Going" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NOT_GOING", label: "Not going" },
];

function formatWhen(event) {
  const start = new Date(event.startDate);
  const date = start.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: event.timezone,
  });
  const time = start
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: event.timezone,
      timeZoneName: "short",
    })
    .replace(" ", "");
  const place = event.locationType === "ONLINE_LINK" ? "Zoom" : "In person";
  return `${date} · ${time} · ${place}`;
}

/** The one tinted surface in the app. */
export default function NextEventCard({ event, onRsvp }) {
  if (!event) return null;

  return (
    <Card padding={18} radius="panel" tint="sage" className="p-[22px] text-sage-900">
      <p className="text-kicker font-bold">Next up</p>
      <h4 className="text-xl mt-1">{event.title}</h4>
      <p className="text-ui mt-1">{formatWhen(event)}</p>

      <div role="group" aria-label="RSVP" className="mt-4 flex flex-wrap gap-2">
        {RSVPS.map((rsvp) => {
          const selected = event.myRsvp === rsvp.value;
          return (
            <button
              key={rsvp.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onRsvp?.(rsvp.value)}
              className={cn("btn", selected ? "bg-brand text-ground" : "bg-sand-200 text-ink")}
            >
              {rsvp.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-meta">
        {`${event.attendeeCount} going · `}
        <a href={`/api/events/${event.id}/ics`} className="text-sage-900 underline">
          add to your calendar
        </a>
      </p>
    </Card>
  );
}
