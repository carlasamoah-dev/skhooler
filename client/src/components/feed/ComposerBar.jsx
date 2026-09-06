"use client";

import Link from "next/link";

import { Avatar, Card } from "@/components/ui";

/** Rendered only where `can('post:create')` holds — owners and admins. */
export default function ComposerBar({ user, slug }) {
  const name = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <Card padding={18} radius="card" className="flex items-center gap-3">
      <Avatar name={name} src={user?.avatarUrl ?? undefined} size={42} />
      <p className="text-base text-sand-600 truncate">Post an update for your members</p>
      <Link href={`/${slug}/posts/new`} className="btn btn-primary ml-auto shrink-0 no-underline">
        Write a post
      </Link>
    </Card>
  );
}
