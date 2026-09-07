"use client";

import { useComposerStore } from "@/store/useComposerStore";
import { Avatar, Card } from "@/components/ui";

/** Rendered only where `can('post:create')` holds — owners and admins. */
export default function ComposerBar({ user, slug }) {
  const name = user ? `${user.firstName} ${user.lastName}` : "";
  const openModal = useComposerStore((s) => s.openModal);

  return (
    <Card padding={18} radius="card" className="flex items-center gap-3 cursor-text" onClick={openModal}>
      <Avatar name={name} src={user?.avatarUrl ?? undefined} size={42} />
      <p className="text-base text-sand-600 truncate">Write something...</p>
      <button className="btn btn-primary ml-auto shrink-0" onClick={(e) => { e.stopPropagation(); openModal(); }}>
        Write post
      </button>
    </Card>
  );
}
