"use client";

import { Card } from "@/components/ui";
import { dayKey, monthGridCells, occurrencesIn, zonedKey } from "@/lib/calendar";
import DayCell from "./DayCell";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthGrid({ month, events = [], timeZone, today, onSelectEvent }) {
  const cells = monthGridCells(month);
  const todayKey = zonedKey(today, timeZone);

  // Each event contributes a day key per occurrence inside the visible range,
  // so a weekly rule lands on every matching cell rather than only its first.
  const byDay = new Map();
  for (const event of events) {
    for (const key of occurrencesIn(event, cells, timeZone)) {
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(event);
    }
  }

  return (
    <Card padding={18} radius="panel" className="p-5">
      <div className="grid grid-cols-7 gap-1.5 pb-2 mb-2 border-b border-sand-300">
        {WEEKDAYS.map((day) => (
          <span key={day} className="text-kicker font-semibold text-sand-700 text-center">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell) => {
          const key = dayKey(cell.year, cell.month, cell.day);
          return (
            <DayCell
              key={key}
              cell={cell}
              isToday={key === todayKey}
              events={byDay.get(key) ?? []}
              onSelectEvent={onSelectEvent}
            />
          );
        })}
      </div>
    </Card>
  );
}
