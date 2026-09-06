import { create } from "zustand";

import { fetchGroupBundle } from "@/lib/api";

/**
 * Group context for the current slug. Hydrated once per slug; every screen in
 * the app shell reads role, categories and tiers from here rather than refetching.
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

    // A forced refresh keeps the current data on screen while it reloads.
    set({ slug, status: force ? get().status : "loading", error: null });
    try {
      const bundle = await fetchGroupBundle(slug);
      // A newer slug may have started loading while this request was in flight.
      if (get().slug !== slug) return;
      set({ ...bundle, status: "ready" });
    } catch (error) {
      if (get().slug !== slug) return;
      set({ status: "error", error: error?.message ?? "Could not load this group." });
    }
  },
}));
