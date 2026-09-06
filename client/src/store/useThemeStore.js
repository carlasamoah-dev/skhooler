import { create } from 'zustand';

export const THEME_STORAGE_KEY = 'skhooler-theme';

/**
 * Resolve the theme to use on the client: an explicit stored choice wins,
 * otherwise fall back to the OS preference. Mirrors the pre-paint script in
 * the root layout, so the store and the <html> class always agree.
 */
function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Private mode or blocked storage: fall through to the OS preference.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Persist only deliberate choices, so a theme merely inherited from the OS
 * preference does not get pinned and stop following it.
 */
function persist(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the theme still applies for this page view.
  }
}

export const useThemeStore = create((set) => ({
  theme: resolveInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      persist(next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    persist(theme);
    set({ theme });
  },
}));
