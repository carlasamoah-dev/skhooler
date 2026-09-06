import { create } from "zustand";

import * as auth from "@/lib/authClient";

/**
 * The signed-in user. Deliberately holds no tokens: those live in httpOnly
 * cookies that browser script cannot read, which is the point of that choice.
 */
export const useSessionStore = create((set) => ({
  user: null,
  status: "unknown", // unknown | loading | authenticated | anonymous

  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),

  /** Called once on mount to turn the cookie into a user. */
  async bootstrap() {
    set({ status: "loading" });
    try {
      const { user } = await auth.fetchMe();
      set({ user, status: user ? "authenticated" : "anonymous" });
    } catch {
      set({ user: null, status: "anonymous" });
    }
  },

  async signOut() {
    try {
      await auth.logout();
    } finally {
      set({ user: null, status: "anonymous" });
    }
  },
}));
