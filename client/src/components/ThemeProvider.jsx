"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

/**
 * Keeps the `dark` class on <html> in step with the store. The class is first
 * applied by the pre-paint script in the root layout, so this only has work to
 * do once the theme actually changes.
 */
export default function ThemeProvider({ children }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return children;
}
