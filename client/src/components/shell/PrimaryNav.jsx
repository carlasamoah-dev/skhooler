"use client";

import { useRouter } from "next/navigation";

import { SegmentedControl } from "@/components/ui";

/** Order is the on-screen order; `href` is relative to the group. */
export const NAV_ITEMS = [
  { value: "feed", label: "Community", path: "/community" },
  { value: "class", label: "Classroom", path: "/classroom" },
  { value: "cal", label: "Calendar", path: "/calendar" },
  { value: "members", label: "Members", path: "/members" },
  { value: "dash", label: "Dashboard", path: "/dashboard" },
  { value: "settings", label: "Settings", path: "/settings/general" },
];

export default function PrimaryNav({ slug, active }) {
  const router = useRouter();

  return (
    <SegmentedControl
      label="Sections"
      options={NAV_ITEMS}
      value={active}
      columns={NAV_ITEMS.length}
      onChange={(value) => {
        const item = NAV_ITEMS.find((i) => i.value === value);
        if (item) router.push(`/${slug}${item.path}`);
      }}
      className="flex-1 min-w-0"
    />
  );
}
