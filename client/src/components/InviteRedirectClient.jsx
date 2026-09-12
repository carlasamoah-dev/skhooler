"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";

export default function InviteRedirectClient({ code }) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const sessionStatus = useSessionStore((s) => s.status);


  const [state, setState] = useState("loading"); // loading | joining | success | error | already_member
  const [groupSlug, setGroupSlug] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Validate invite code — fetch group info without auth
  useEffect(() => {
    if (!code) return;
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

    fetch(`${API_URL}/groups/invite/${code}/validate`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.data?.group) throw new Error("Invalid invite link");
        setGroupSlug(data.data.group.slug);
        setGroupName(data.data.group.name);
        setState("ready");
      })
      .catch((err) => {
        setState("error");
        setErrorMsg(err.message || "This invite link is invalid or has expired.");
      });
  }, [code]);

  // Step 2: When session is ready, decide what to do
  useEffect(() => {
    if (state !== "ready") return;
    if (sessionStatus === "unknown" || sessionStatus === "loading") return;

    if (sessionStatus === "anonymous") {
      // Redirect to login with a ?next= pointing back to this invite page,
      // so after login the user is returned here and the join flow resumes.
      router.push(`/login?next=/invite/${code}`);
      return;
    }

    // User is authenticated — proceed to join
    joinViaCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, sessionStatus]);

  // Step 3: If this page is re-mounted with a logged-in user after redirect-back
  useEffect(() => {
    if (!user || sessionStatus !== "authenticated") return;
    if (state === "ready") {
      joinViaCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionStatus]);

  async function joinViaCode() {
    setState("joining");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      const res = await fetch(`${API_URL}/groups/join/${code}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error?.message || data?.message || "Could not join community"
        );
      }

      const result = data?.data ?? data;

      if (result?.status === "already_member") {
        setState("already_member");
        if (result?.group?.slug || groupSlug) {
          setTimeout(
            () => router.push(`/${result?.group?.slug || groupSlug}/community`),
            1200
          );
        }
        return;
      }

      if (result?.status === "requires_approval") {
        // Has manual approval + questions — send to landing page join flow
        router.push(`/${result.groupSlug}/join`);
        return;
      }

      // Successfully joined
      setState("success");
      const slug = result?.group?.slug || groupSlug;
      if (slug) {
        setTimeout(() => router.push(`/${slug}/community`), 1500);
      }
    } catch (err) {
      setState("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (state === "loading" || state === "joining") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-sand-400" />
        <p className="text-sand-600 font-medium">
          {state === "joining" ? "Joining community…" : "Checking invite link…"}
        </p>
      </div>
    );
  }

  if (state === "success" || state === "already_member") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-ground" />
        </div>
        <h2 className="text-2xl font-bold text-ink">
          {state === "already_member"
            ? `You're already a member!`
            : `Welcome to ${groupName || "the community"}!`}
        </h2>
        <p className="text-sand-600">Taking you there…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="w-16 h-16 rounded-full bg-sand-100 border border-divider flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-sand-400" />
        </div>
        <h2 className="text-xl font-bold text-ink">Invite not valid</h2>
        <p className="text-sand-600 text-center max-w-sm">{errorMsg}</p>
        <button
          onClick={() => router.push("/discover")}
          className="btn btn-secondary mt-2"
        >
          Explore communities
        </button>
      </div>
    );
  }

  // state === "ready" && no user — waiting for auth modal
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-sand-400" />
      <p className="text-sand-600 font-medium">Waiting for sign-in…</p>
    </div>
  );
}
