import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/ui";

export default function Page() {
  return <EmptyState icon={CalendarDays} title="Calendar" body="The month grid, event list and RSVPs arrive in phase 5." />;
}
