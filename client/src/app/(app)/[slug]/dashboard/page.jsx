import { ChartColumn } from "lucide-react";

import { EmptyState } from "@/components/ui";

export default function Page() {
  return <EmptyState icon={ChartColumn} title="Dashboard" body="Stats, the signups chart and referral payouts arrive in phase 7." />;
}
