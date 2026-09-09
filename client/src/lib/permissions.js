"use client";

import { useGroupStore } from "@/store/useGroupStore";

const ROLE_RANK = { MEMBER: 0, MODERATOR: 1, ADMIN: 2, OWNER: 3 };

/**
 * Minimum role each action needs.
 * Actions not listed here are denied by default.
 *
 * Role hierarchy (ascending):
 *   MEMBER → MODERATOR → ADMIN → OWNER
 */
const REQUIRES = {
  // Feed
  "post:create":       "MODERATOR", // Moderators+ manage content
  "post:pin":          "MODERATOR",
  "post:delete":       "MODERATOR",
  "comment:create":    "MEMBER",    // All members can comment

  // Members management
  "member:remove":     "MODERATOR",
  "member:approve":    "MODERATOR",
  "member:role":       "ADMIN",     // Only Admins/Owners can change roles

  // Classroom (LMS)
  "course:create":     "ADMIN",
  "course:edit":       "ADMIN",

  // Events / Calendar
  "event:create":      "ADMIN",

  // Dashboard & Analytics
  "analytics:view":    "ADMIN",
  "analytics:revenue": "OWNER",

  // Settings
  "group:settings":    "ADMIN",     // Admins can access settings (not billing)
  "billing:view":      "OWNER",     // Only Owner sees Billing
  "ownership:transfer":"OWNER",
};

export function canWithRole(role, action) {
  const needed = REQUIRES[action];
  if (!needed) return false;
  return (ROLE_RANK[role] ?? -1) >= ROLE_RANK[needed];
}

/**
 * React hook — returns a `can(action)` function scoped to the current
 * user's membership role in the active community.
 *
 * Components should call `useCan()` once and reuse the returned function.
 * Because it reads from the Zustand store it will re-render whenever the
 * membership role changes (e.g. immediately after a role-change mutation).
 */
export function useCan() {
  const role = useGroupStore((state) => state.membership?.role);
  return (action) => canWithRole(role, action);
}

/** Expose current role directly for components that need conditional rendering beyond actions */
export function useRole() {
  return useGroupStore((state) => state.membership?.role ?? null);
}
