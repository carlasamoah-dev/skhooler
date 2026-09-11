"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";

export default function HomePage() {
  const router = useRouter();
  const { status, communities } = useSessionStore();

  useEffect(() => {
    // Wait until auth state is known
    if (status === "unknown" || status === "loading") return;

    if (status === "anonymous") {
      router.replace("/discover");
      return;
    }

    if (status === "authenticated" && communities.length > 0) {
      router.replace(`/${communities[0].slug}/community`);
      return;
    }
  }, [status, communities, router]);

  // If we are authenticated but have no communities, we stay on this page to show the empty state.
  if (status !== "authenticated" || communities.length > 0) {
    return null; // Will redirect shortly
  }

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface border border-dashed border-divider rounded-2xl p-10 flex flex-col items-center shadow-soft">
        <div className="w-16 h-16 bg-brand-50 text-brand rounded-full flex items-center justify-center mb-6">
          <PlusCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">Welcome to Skhooler!</h1>
        <p className="text-[15px] text-sand-700 mb-8">
          You don't belong to any communities yet. Get started by creating your own community.
        </p>
        <Link href="/create" className="btn btn-primary h-12 px-8 text-[15px]">
          Create community
        </Link>
      </div>
    </div>
  );
}
