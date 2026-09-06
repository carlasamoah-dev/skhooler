"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { Card, SegmentedControl } from "@/components/ui";

const INTERVALS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const TITLE = { day: "Signups per day", week: "Signups per week", month: "Signups per month" };

export default function SignupsChart({ points = [], interval = "week", onIntervalChange, loading }) {
  const [hovered, setHovered] = useState(null);

  const peak = points.reduce((best, p) => (p.value > (best?.value ?? -1) ? p : best), null);
  const max = Math.max(1, ...points.map((p) => p.value));
  const shown = hovered != null ? points[hovered] : null;

  return (
    <Card padding={24} radius="panel" className="p-[26px]">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-[19px] whitespace-nowrap">{TITLE[interval]}</h3>

        <p
          aria-live="polite"
          className={cn("text-meta font-bold ml-auto", shown ? "text-brand-700" : "text-sand-700")}
        >
          {shown ? `${shown.value} · ${shown.label}` : peak ? `Peak ${peak.value} · ${peak.label}` : ""}
        </p>

        <SegmentedControl
          label="Interval"
          options={INTERVALS}
          value={interval}
          onChange={onIntervalChange}
          className="shrink-0"
        />
      </div>

      <div
        className={cn("mt-6 flex items-end gap-2.5 h-[170px] transition-opacity", loading && "opacity-50")}
        onMouseLeave={() => setHovered(null)}
      >
        {points.map((point, index) => (
          <div key={point.label} className="flex-1 min-w-0 h-full flex items-end">
            <button
              type="button"
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              aria-label={`${point.label}: ${point.value} signups`}
              style={{ height: `${(point.value / max) * 100}%` }}
              className={cn(
                "w-full rounded-full transition-colors",
                hovered === index ? "bg-brand" : "bg-brand-300",
              )}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2.5">
        {points.map((point) => (
          <span key={point.label} className="flex-1 min-w-0 text-[11px] font-semibold text-sand-700 text-center truncate">
            {point.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
