import { create } from "zustand";

export const useComposerStore = create((set) => ({
  isOpen: false,
  editPost: null, // Holds the post object when editing
  openModal: (editPost = null) => set({ isOpen: true, editPost }),
  closeModal: () => set({ isOpen: false, editPost: null }),
}));
