"use client";

import { SORTS } from "@/store/useFeedStore";
import { Select } from "@/components/ui";

export default function SortSelect({ value, onChange }) {
  return <Select label={undefined} aria-label="Sort" size="sm" options={SORTS} value={value} onChange={onChange} />;
}
