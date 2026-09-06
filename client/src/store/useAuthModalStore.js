import { create } from "zustand";

/** `mode` is null while the dialog is closed. */
export const useAuthModalStore = create((set) => ({
  mode: null, // 'login' | 'signup' | null
  openModal: (mode = "login") => set({ mode }),
  closeModal: () => set({ mode: null }),
}));
