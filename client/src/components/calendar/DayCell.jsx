import { cn } from "@/lib/cn";
import { formatEventTime } from "@/lib/calendar";

export default function DayCell({ cell, isToday, events = [], onSelectEvent }) {
  return (
    <div
      className={cn(
        "min-h-[110px] rounded-well border p-1.5 flex flex-col gap-1",
        cell.inMonth ? "bg-surface border-sand-300" : "bg-transparent border-sand-300 text-sand-500",
        isToday && "border-brand",
      )}
    >
      <span
        className={cn(
          "w-[26px] h-[26px] rounded-full grid place-items-center text-meta font-semibold shrink-0",
          isToday && "bg-brand text-ground",
        )}
      >
        {cell.day}
      </span>

      {events.map((event) => (
        <button
          key={event.id}
          type="button"
          onClick={() => onSelectEvent?.(event)}
          className={cn(
            "text-left rounded-chip px-2.5 py-2 bg-brand text-ground text-kicker",
            event.isCancelled && "line-through opacity-70",
          )}
        >
          <span className="block font-display font-extrabold">{formatEventTime(event)}</span>
          <span className="block truncate">{event.title}</span>
        </button>
      ))}
    </div>
  );
}
