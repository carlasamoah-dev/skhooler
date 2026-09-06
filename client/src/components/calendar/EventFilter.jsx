"use client";

import { SegmentedControl } from "@/components/ui";

const OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

export default function EventFilter({ value, onChange }) {
  return <SegmentedControl label="Event filter" options={OPTIONS} value={value} onChange={onChange} />;
}
