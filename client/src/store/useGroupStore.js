import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
}

/**
 * Group context for the current slug. Hydrated once per slug by AppShell.
 * Fetches real data from GET /api/groups/:slug (requires membership).
 */
export const useGroupStore = create((set, get) => ({
  slug: null,
  group: null,
  membership: null,
  categories: [],
  tiers: [],
  user: null,
  status: "idle", // idle | loading | ready | error
  error: null,

  async hydrate(slug, { force = false } = {}) {
    if (!slug) return;
    const { slug: current, status } = get();
    if (!force && current === slug && (status === "ready" || status === "loading")) return;

    set({ slug, status: force ? get().status : "loading", error: null });

    try {
      const { authFetch } = await import("@/lib/api");
      const g = await authFetch(`/groups/${slug}`, { cache: "no-store" });

      // Map backend shape to what the app shell expects
      // The backend returns the group with owner, categories, memberTiers, userMembership, _count
      const group = {
        id: g.id,
        slug: g.slug,
        name: g.name,
        description: g.description ?? "",
        iconUrl: g.iconUrl ?? null,
        coverUrl: g.coverUrl ?? null,
        visibility: g.visibility,
        pricingModel: g.pricingModel,
        price: g.price,
        billingInterval: g.billingInterval,
        trialDays: g.trialDays,
        joinApproval: g.joinApproval,
        memberCount: g.memberCount ?? g._count?.members ?? 0,
        tags: g.tags ?? [],
        createdAt: g.createdAt,
        // Stats for GroupCard
        stats: {
          memberCount: g.memberCount ?? g._count?.members ?? 0,
          onlineCount: 0,   // not yet wired — needs a presence system
          adminCount: 0,    // not yet wired — computed separately when needed
        },
        // Owner info for TopBar
        owner: g.owner ?? null,
        ownerName: g.owner ? `${g.owner.firstName} ${g.owner.lastName}` : "",
      };

      // Map backend membership to what the permission system expects
      const membership = g.userMembership
        ? { role: g.userMembership.role, tierId: g.userMembership.tierId ?? null }
        : null;

      // Categories from the group (backend returns them via include)
      const categories = Array.isArray(g.categories) ? g.categories : [];

      // Member tiers
      const tiers = Array.isArray(g.memberTiers) ? g.memberTiers : [];

      // If we ever need to check slug race
      if (get().slug !== slug) return;

      set({ group, membership, categories, tiers, user: null, status: "ready" });
    } catch (error) {
      if (get().slug !== slug) return;
      set({ status: "error", error: error?.message ?? "Could not load this group." });
    }
  },

  /**
   * Call this after a successful role-change mutation so every useCan() hook
   * re-evaluates immediately without requiring a page reload.
   */
  updateMembershipRole(newRole) {
    const { membership } = get();
    if (!membership) return;
    set({ membership: { ...membership, role: newRole } });
  },
}));
