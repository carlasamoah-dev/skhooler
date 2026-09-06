"use client";

import { useGroupStore } from "@/store/useGroupStore";

const ROLE_RANK = { MEMBER: 0, MODERATOR: 1, ADMIN: 2, OWNER: 3 };

/** Minimum role each action needs. Anything absent is denied. */
const REQUIRES = {
  "post:create": "ADMIN",
  "post:pin": "MODERATOR",
  "post:delete": "MODERATOR",
  "comment:create": "MEMBER",
  "member:remove": "MODERATOR",
  "member:approve": "MODERATOR",
  "member:role": "ADMIN",
  "course:create": "ADMIN",
  "event:create": "ADMIN",
  "group:settings": "OWNER",
  "analytics:view": "ADMIN",
  "analytics:revenue": "OWNER",
};

export function canWithRole(role, action) {
  const needed = REQUIRES[action];
  if (!needed) return false;
  return (ROLE_RANK[role] ?? -1) >= ROLE_RANK[needed];
}

/**
 * `can('post:create')` against the current membership. Actions the role cannot
 * perform should not be rendered at all, rather than rendered and disabled.
 */
export function useCan() {
  const role = useGroupStore((state) => state.membership?.role);
  return (action) => canWithRole(role, action);
}
