"use client";

import { useEffect } from "react";

import { useSessionStore } from "@/store/useSessionStore";

/** Turns the httpOnly cookie into a user once per page load. */
export default function SessionProvider({ children }) {
  const bootstrap = useSessionStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return children;
}
