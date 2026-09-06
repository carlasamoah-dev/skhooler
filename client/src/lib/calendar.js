/** Date, recurrence and calendar-file helpers for the events screens. */

const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
export const WEEKDAY_NAMES = {
  MO: "Monday", TU: "Tuesday", WE: "Wednesday", TH: "Thursday",
  FR: "Friday", SA: "Saturday", SU: "Sunday",
};

/**
 * The calendar year, month, day and weekday an instant falls on in a given
 * timezone. Placing events on a grid by UTC would drop them in the wrong cell
 * either side of midnight.
 */
export function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(date));

  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday"),
  };
}

/** "2026-09-10" for the day an instant falls on in `timeZone`. */
export function zonedKey(date, timeZone) {
  const { year, month, day } = zonedParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function dayKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** The 35 Monday-first cells covering `month`, as {year, month, day, inMonth}. */
export function monthGridCells(month) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(Date.UTC(year, monthIndex, 1));
  // getUTCDay is Sunday-based; shift so Monday starts the week.
  const lead = (first.getUTCDay() + 6) % 7;

  return Array.from({ length: 35 }, (_, i) => {
    const date = new Date(Date.UTC(year, monthIndex, 1 - lead + i));
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === monthIndex,
    };
  });
}

/** `FREQ=WEEKLY;BYDAY=TH` -> { FREQ: 'WEEKLY', BYDAY: ['TH'] }. */
export function parseRule(rule) {
  if (!rule) return null;
  const out = {};
  for (const pair of rule.split(";")) {
    const [key, value] = pair.split("=");
    if (!key || !value) continue;
    out[key.toUpperCase()] = value;
  }
  if (out.BYDAY) out.BYDAY = out.BYDAY.split(",");
  if (out.COUNT) out.COUNT = Number(out.COUNT);
  return out;
}

/**
 * Every day in `cells` the event lands on, as a Set of day keys. A
 * non-recurring event yields at most one; a weekly rule yields one per
 * matching weekday in the range.
 */
export function occurrencesIn(event, cells, timeZone) {
  const start = zonedParts(event.startDate, timeZone);
  const startKey = dayKey(start.year, start.month, start.day);
  const keys = new Set();

  if (!event.isRecurring || !event.recurrenceRule) {
    if (cells.some((c) => dayKey(c.year, c.month, c.day) === startKey)) keys.add(startKey);
    return keys;
  }

  const rule = parseRule(event.recurrenceRule);
  const until = rule.UNTIL ? new Date(rule.UNTIL) : null;
  const days = rule.BYDAY ?? [WEEKDAY_CODES[new Date(event.startDate).getUTCDay()]];

  for (const cell of cells) {
    const key = dayKey(cell.year, cell.month, cell.day);
    // A recurrence never runs before its first occurrence.
    if (key < startKey) continue;
    const cellDate = new Date(Date.UTC(cell.year, cell.month - 1, cell.day));
    if (until && cellDate > until) continue;

    const code = WEEKDAY_CODES[cellDate.getUTCDay()];
    const freq = rule.FREQ ?? "WEEKLY";

    if (freq === "DAILY") keys.add(key);
    else if (freq === "WEEKLY" && days.includes(code)) keys.add(key);
    else if (freq === "MONTHLY" && cell.day === start.day) keys.add(key);
    else if (freq === "YEARLY" && cell.day === start.day && cell.month === start.month) keys.add(key);
  }

  return keys;
}

/** "Weekly on Thursday" / "Does not repeat". */
export function describeRecurrence(event) {
  if (!event.isRecurring || !event.recurrenceRule) return "Does not repeat";
  const rule = parseRule(event.recurrenceRule);
  if (rule.FREQ === "WEEKLY" && rule.BYDAY?.length) {
    return `Weekly on ${rule.BYDAY.map((d) => WEEKDAY_NAMES[d] ?? d).join(", ")}`;
  }
  return `Repeats ${String(rule.FREQ ?? "").toLowerCase()}`;
}

export function formatEventTime(event, timeZone = event.timezone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  })
    .format(new Date(event.startDate))
    .replace(" ", "")
    .replace(/\u202f/g, "");
}

export const LOCATION_LABEL = {
  ONLINE_LINK: "Online link",
  PHYSICAL_ADDRESS: "In person",
  RECORDED_SESSION: "Recorded session",
};

/* ----------------------------------- ics ---------------------------------- */

const icsStamp = (value) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// RFC 5545 escaping for text values.
const icsText = (value = "") =>
  String(value).replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildIcs(event) {
  const end = event.endDate ?? new Date(new Date(event.startDate).getTime() + 3_600_000).toISOString();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Skhooler//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@skhooler.com`,
    `DTSTAMP:${icsStamp(Date.now())}`,
    `DTSTART:${icsStamp(event.startDate)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(event.title)}`,
  ];

  if (event.description) lines.push(`DESCRIPTION:${icsText(event.description)}`);
  if (event.locationUrl || event.locationAddress) {
    lines.push(`LOCATION:${icsText(event.locationUrl ?? event.locationAddress)}`);
  }
  if (event.isRecurring && event.recurrenceRule) lines.push(`RRULE:${event.recurrenceRule}`);
  if (event.isCancelled) lines.push("STATUS:CANCELLED");

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Builds the file in the browser. The real API serves it from
 * `/api/groups/:slug/events/:eventId/ics`; swapping to that is a one-line change.
 */
export function downloadIcs(event) {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title.replace(/[^\w -]/g, "").trim() || "event"}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
