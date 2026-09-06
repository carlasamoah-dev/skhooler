import { Settings } from "lucide-react";

import { EmptyState } from "@/components/ui";

const TITLES = {
  general: "General",
  pricing: "Pricing & tiers",
  categories: "Categories",
  questions: "Join questions",
  notifications: "Notifications",
  invites: "Invites",
};

export default async function Page({ params }) {
  const { tab } = await params;
  return (
    <EmptyState
      icon={Settings}
      title={TITLES[tab] ?? "Settings"}
      body="The six settings panels arrive in phase 8."
    />
  );
}
