import { create } from "zustand";
import * as mockAuth from "@/lib/mockAuth";

// Initial mock joined communities
const INITIAL_COMMUNITIES = [
  { slug: "remote-jobs-hq", name: "Remote Jobs HQ", iconUrl: null },
  { slug: "maker-school", name: "Maker School", iconUrl: null }
];

export const useSessionStore = create((set) => ({
  user: null,
  communities: [],
  status: "unknown", // unknown | loading | authenticated | anonymous
  
  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),
  
  addCommunity: (community) => set((state) => ({
    communities: [...state.communities, community]
  })),

  async bootstrap() {
    set({ status: "loading" });
    try {
      const { user } = await mockAuth.me();
      // On boot, set user and seed with mock communities
      set({ user, communities: INITIAL_COMMUNITIES, status: user ? "authenticated" : "anonymous" });
    } catch {
      set({ user: null, communities: [], status: "anonymous" });
    }
  },

  async signOut() {
    try {
      await mockAuth.logout();
    } finally {
      set({ user: null, communities: [], status: "anonymous" });
    }
  }
}));
