import { create } from "zustand";
import * as auth from "@/lib/auth";

export const useSessionStore = create((set) => ({
  user: null,
  communities: [],
  status: "unknown", // unknown | loading | authenticated | anonymous

  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),

  addCommunity: (community) =>
    set((state) => ({
      communities: [...state.communities, community],
    })),

  /**
   * Called once on app boot. Checks localStorage for a token and validates it
   * with the backend. Sets the user if valid, otherwise goes anonymous.
   */
  async bootstrap() {
    // Skip if no token at all — go straight to anonymous
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      set({ user: null, communities: [], status: "anonymous" });
      return;
    }

    set({ status: "loading" });
    try {
      const { user, communities } = await auth.me();
      set({ user, communities, status: user ? "authenticated" : "anonymous" });
    } catch {
      // Token expired or invalid — clear it
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, communities: [], status: "anonymous" });
    }
  },

  async signOut() {
    try {
      await auth.logout();
    } finally {
      set({ user: null, communities: [], status: "anonymous" });
    }
  },
}));
