"use client";

import { useRouter } from "next/navigation";

import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { SegmentedControl } from "@/components/ui";

/** Full nav — filtered per role before rendering */
const ALL_NAV_ITEMS = [
  { value: "feed",     label: "Community",  path: "/community",       minAction: null },
  { value: "class",   label: "Classroom",  path: "/classroom",       minAction: null },
  { value: "cal",     label: "Calendar",   path: "/calendar",        minAction: null },
  { value: "members", label: "Members",    path: "/members",         minAction: null },
  { value: "dash",    label: "Dashboard",  path: "/dashboard",       minAction: "analytics:view" },
  { value: "settings",label: "Settings",   path: "/settings/general",minAction: "group:settings" },
];

export default function PrimaryNav({ slug, active }) {
  const router = useRouter();
  const can = useCan();

  // Only show nav items the current role is allowed to visit
  const navItems = ALL_NAV_ITEMS.filter(
    (item) => item.minAction === null || can(item.minAction)
  );

  return (
    <SegmentedControl
      label="Sections"
      options={navItems}
      value={active}
      columns={navItems.length}
      onChange={(value) => {
        const item = navItems.find((i) => i.value === value);
        if (item) router.push(`/${slug}${item.path}`);
      }}
      className="flex-1 min-w-0"
    />
  );
}
