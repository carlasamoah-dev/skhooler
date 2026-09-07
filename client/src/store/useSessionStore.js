import { create } from "zustand";
import * as mockAuth from "@/lib/mockAuth";

export const useSessionStore = create((set) => ({
  user: null,
  status: "unknown", // unknown | loading | authenticated | anonymous
  
  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),
  
  async bootstrap() {
    set({ status: "loading" });
    try {
      const { user } = await mockAuth.me();
      set({ user, status: user ? "authenticated" : "anonymous" });
    } catch {
      set({ user: null, status: "anonymous" });
    }
  },

  async signOut() {
    try {
      await mockAuth.logout();
    } finally {
      set({ user: null, status: "anonymous" });
    }
  }
}));
