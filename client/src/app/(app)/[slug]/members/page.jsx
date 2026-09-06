import { Users } from "lucide-react";

import { EmptyState } from "@/components/ui";

export default function Page() {
  return <EmptyState icon={Users} title="Members" body="The roster, join requests and map arrive in phase 6." />;
}
