"use client";

import { Users } from "lucide-react";

import { EmptyState, Skeleton } from "@/components/ui";
import MemberRow from "./MemberRow";

export default function MemberRoster({ members, loading, onOpenMembership }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton variant="row" count={4} className="h-[88px]" />
      </div>
    );
  }

  if (members.length === 0) {
    return <EmptyState icon={Users} title="Nobody here yet" body="No one in the group holds this role." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => (
        <MemberRow key={member.id} member={member} onOpenMembership={onOpenMembership} />
      ))}
    </div>
  );
}
