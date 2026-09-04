import { create } from 'zustand';

export const useAuthModalStore = create((set) => ({
  isOpen: false,
  view: 'login', // 'login', 'signup', 'forgot'
  openModal: (view = 'login') => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
}));
