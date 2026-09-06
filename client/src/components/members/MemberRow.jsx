"use client";

import { flagEmoji, relativeTime } from "@/lib/format";
import { Avatar, Button, Card, StatusDot } from "@/components/ui";

const ROLE = {
  OWNER: { tone: "brand", label: "Owner" },
  ADMIN: { tone: "brand", label: "Admin" },
  MODERATOR: { tone: "sage", label: "Moderator" },
  MEMBER: { tone: "neutral", label: "Member" },
};

export default function MemberRow({ member, onOpenMembership }) {
  const { user } = member;
  const name = `${user.firstName} ${user.lastName}`;
  const role = ROLE[member.role] ?? ROLE.MEMBER;
  const joined = new Date(member.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <Card
      as="article"
      padding={18}
      radius="card"
      className="min-h-[88px] px-6 py-[18px] grid items-center gap-[18px] grid-cols-1 lg:grid-cols-[52px_minmax(0,230px)_minmax(0,1.2fr)_minmax(0,176px)_auto]"
    >
      {/* The badge is anchored to the avatar, so it sits identically on every row. */}
      <Avatar
        name={name}
        src={user.avatarUrl ?? undefined}
        size={52}
        presence={member.isOnline ? "online" : "offline"}
      />

      <div className="min-w-0">
        <p className="font-display font-extrabold text-lg tracking-[-0.02em] truncate">{name}</p>
        <StatusDot tone={role.tone} label={role.label} />
        <p className="text-meta text-sand-700 truncate">
          {`${flagEmoji(user.countryCode)} ${user.countryCode} @${user.handle}`}
        </p>
      </div>

      <p className="text-ui text-sand-800 line-clamp-2">{member.bio}</p>

      <div className="lg:text-right">
        <p className="text-meta text-sand-700">{member.tier?.name ?? "No tier"}</p>
        <p className="text-meta text-sand-700">
          {`active ${relativeTime(member.lastActiveAt)} · joined ${joined}`}
        </p>
      </div>

      <Button variant="secondary" onClick={() => onOpenMembership?.(member.id)}>
        Membership
      </Button>
    </Card>
  );
}
