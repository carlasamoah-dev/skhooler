"use client";

import { useState } from "react";

import { changeMemberRole, changeMemberTier, removeMember, setCourseAccess } from "@/lib/api";
import { flagEmoji, relativeTime } from "@/lib/format";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { Avatar, Button, Checkbox, Dialog, Select } from "@/components/ui";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "MEMBER", label: "Member" },
];

function Well({ label, children, action }) {
  return (
    <div className="bg-sand-100 rounded-well px-[18px] py-3.5">
      <p className="text-kicker font-bold text-sand-700">{label}</p>
      <div className="mt-1 text-ui">{children}</div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export default function MembershipDialog({ open, member, tiers = [], courses = [], onClose, onChanged }) {
  const can = useCan();
  const { membership, updateMembershipRole } = useGroupStore();
  const [role, setRole] = useState(member?.role ?? "MEMBER");
  const [tierId, setTierId] = useState(member?.tier?.id ?? "");
  const [access, setAccess] = useState(() => new Set(member?.courseAccess ?? []));
  const [busy, setBusy] = useState(false);

  if (!open || !member) return null;

  const canChangeRole = can("member:role");
  const canRemove = can("member:remove");

  const { user } = member;
  const name = `${user.firstName} ${user.lastName}`;
  const joined = new Date(member.joinedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const save = async () => {
    setBusy(true);
    try {
      if (canChangeRole && role !== member.role) {
        await changeMemberRole(member.id, role);
        // If this is the current user's own membership, update the store
        // so all role gates re-evaluate instantly everywhere.
        if (member.id === membership?.id || user.id === membership?.userId) {
          updateMembershipRole(role);
        }
      }
      if ((tierId || null) !== (member.tier?.id ?? null)) await changeMemberTier(member.id, tierId || null);
      for (const course of courses) {
        const had = (member.courseAccess ?? []).includes(course.id);
        const has = access.has(course.id);
        if (had !== has) await setCourseAccess(member.id, course.id, has);
      }
      await onChanged?.();
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} width={640} className="p-8">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={user.avatarUrl ?? undefined} size={52} />
        <div>
          <h2 className="text-[22px]">{name}</h2>
          <p className="text-meta text-sand-700">Membership settings</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <Well label="Email">{user.email}</Well>
        <Well label="Joined">{`${joined} · ${member.joinedVia}`}</Well>

        {/* Role — only Admins/Owners can change roles */}
        <Well
          label="Role"
          action={
            canChangeRole ? (
              <Select aria-label="Change role" size="sm" options={ROLES} value={role} onChange={setRole} />
            ) : null
          }
        >
          {ROLES.find((r) => r.value === role)?.label ?? role}
        </Well>

        <Well
          label="Tier"
          action={
            <Select
              aria-label="Change tier"
              size="sm"
              value={tierId}
              onChange={setTierId}
              options={[{ value: "", label: "No tier" }, ...tiers.map((t) => ({ value: t.id, label: t.name }))]}
            />
          }
        >
          {tiers.find((t) => t.id === tierId)?.name ?? "No tier"}
        </Well>

        <Well label="Posts · comments">{`${member.postCount} · ${member.commentCount}`}</Well>
        <Well label="Lifetime value">{`$${member.lifetimeValue}`}</Well>
        <Well label="Country">{`${flagEmoji(user.countryCode)} ${user.country}`}</Well>
        <Well label="Last active">{relativeTime(member.lastActiveAt)}</Well>
      </div>

      {courses.length > 0 ? (
        <div className="mt-6">
          <p className="field-label">Course access</p>
          <div className="flex flex-col gap-2">
            {courses.map((course) => (
              <Checkbox
                key={course.id}
                wrapped
                label={course.title}
                checked={access.has(course.id)}
                onChange={(on) =>
                  setAccess((s) => {
                    const next = new Set(s);
                    if (on) next.add(course.id);
                    else next.delete(course.id);
                    return next;
                  })
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {canRemove ? (
          <Button
            variant="secondary"
            onClick={async () => {
              await removeMember(member.id);
              await onChanged?.();
              onClose?.();
            }}
          >
            Remove from group
          </Button>
        ) : null}
        <Button className="ml-auto" loading={busy} onClick={save}>
          Save
        </Button>
      </div>
    </Dialog>
  );
}
