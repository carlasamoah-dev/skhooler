"use client";

import { useRouter } from "next/navigation";

import { SegmentedControl } from "@/components/ui";

export const TABS = [
  { value: "general", label: "General" },
  { value: "discovery", label: "Discovery" },
  { value: "pricing", label: "Pricing & tiers" },
  { value: "billing", label: "Billing" },
  { value: "categories", label: "Categories" },
  { value: "questions", label: "Join questions" },
  { value: "notifications", label: "Notifications" },
  { value: "invites", label: "Invites" },
];

export default function SettingsRail({ tab, slug }) {
  const router = useRouter();

  return (
    <SegmentedControl
      label="Settings sections"
      orientation="vertical"
      options={TABS}
      value={tab}
      columns={TABS.length}
      onChange={(value) => router.push(`/${slug}/settings/${value}`)}
      className="self-start w-full"
    />
  );
}
