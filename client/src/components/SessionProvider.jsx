"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";

export default function SessionProvider({ children }) {
  const bootstrap = useSessionStore((s) => s.bootstrap);
  const status = useSessionStore((s) => s.status);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === "unknown" || status === "loading") {
    return null; // Return null or a global loader while restoring session
  }

  return <>{children}</>;
}
