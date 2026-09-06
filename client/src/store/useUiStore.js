import { create } from "zustand";

/** Transient UI state that more than one component needs to agree on. */
export const useUiStore = create((set) => ({
  notifOpen: false,
  eventDialog: { open: false, eventId: null },
  memberDialog: { open: false, memberId: null },
  membersTab: "all",
  settingsTab: "general",

  toggleNotifications: () => set((s) => ({ notifOpen: !s.notifOpen })),
  closeNotifications: () => set({ notifOpen: false }),
  openEventDialog: (eventId = null) => set({ eventDialog: { open: true, eventId } }),
  closeEventDialog: () => set({ eventDialog: { open: false, eventId: null } }),
  openMemberDialog: (memberId) => set({ memberDialog: { open: true, memberId } }),
  closeMemberDialog: () => set({ memberDialog: { open: false, memberId: null } }),
  setMembersTab: (membersTab) => set({ membersTab }),
  setSettingsTab: (settingsTab) => set({ settingsTab }),
}));
