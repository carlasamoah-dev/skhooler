import { Suspense } from "react";

import MembersClient from "@/components/members/MembersClient";
import { Skeleton } from "@/components/ui";

export default function Page() {
  // MembersClient reads ?tab= and ?role=, so it needs a Suspense boundary.
  return (
    <Suspense fallback={<Skeleton variant="card" className="h-[420px]" />}>
      <MembersClient />
    </Suspense>
  );
}
