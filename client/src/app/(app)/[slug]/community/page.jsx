import { MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/ui";

export default function Page() {
  return <EmptyState icon={MessageSquare} title="Community feed" body="Posts, categories and the sidebar cards arrive in phase 3." />;
}
