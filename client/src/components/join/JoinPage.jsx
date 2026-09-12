"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check, Loader2, ChevronLeft, Clock, Users } from "lucide-react";
import { fetchGroupBundle, joinGroup } from "@/lib/api";
import { useSessionStore } from "@/store/useSessionStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";

export default function JoinPage({ slug }) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const sessionStatus = useSessionStore((s) => s.status);
  const openModal = useAuthModalStore((s) => s.openModal);

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null); // 'joined' | 'pending' | null

  // Load community landing data (public endpoint — no auth needed)
  useEffect(() => {
    fetchGroupBundle(slug)
      .then((res) => {
        if (!res) {
          setLoadError("Community not found.");
        } else {
          setCommunity(res.group);
        }
      })
      .catch(() => setLoadError("Could not load community details."))
      .finally(() => setLoading(false));
  }, [slug]);

  // If the session has loaded and the user is not logged in, show auth modal
  useEffect(() => {
    if (sessionStatus === "anonymous") {
      openModal("signup");
    }
  }, [sessionStatus, user, openModal]);

  if (loading || sessionStatus === "unknown" || sessionStatus === "loading") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sand-400" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full p-6">
        <p className="text-lg font-semibold text-ink mb-2">Oops!</p>
        <p className="text-sand-600">{loadError}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 btn btn-secondary"
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Success state: joined immediately (AUTOMATIC) ─────────────────────────
  if (result === "joined") {
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-6 bg-ground">
        <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-ground" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">
          Welcome to {community?.name}!
        </h2>
        <p className="text-sand-600 text-center">Taking you inside…</p>
      </div>
    );
  }

  // ── Pending state: request submitted, awaiting approval ───────────────────
  if (result === "pending") {
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-6 bg-ground">
        <div className="w-16 h-16 rounded-full bg-sand-100 border border-divider flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-sand-500" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-3 text-center">
          Request submitted!
        </h2>
        <p className="text-sand-600 text-center max-w-sm">
          Your request to join <strong>{community?.name}</strong> has been sent
          to the community owner for review. You'll receive an email once your
          request is approved.
        </p>
        <button
          onClick={() => router.push("/discover")}
          className="mt-8 btn btn-secondary"
        >
          Explore other communities
        </button>
      </div>
    );
  }

  // ── Main join form ─────────────────────────────────────────────────────────
  if (!community) return null;

  const isFree = community.pricingModel === "FREE";
  const hasQuestions =
    community.requireJoinQuestions &&
    community.membershipQuestions?.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || sessionStatus === "anonymous") {
      openModal("signup");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({ questionId, answer })
      );
      const res = await joinGroup(slug, { answers: formattedAnswers });

      if (res?.status === "pending") {
        setResult("pending");
      } else {
        // Joined immediately (AUTOMATIC approval or invited link)
        setResult("joined");
        setTimeout(() => router.push(`/${slug}/community`), 1500);
      }
    } catch (err) {
      if (err.status === 409) {
        // Already a member — go straight in
        router.push(`/${slug}/community`);
      } else {
        alert(err.message || "Failed to submit join request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const ctaLabel = isFree ? "Join for free" : `Join for $${Number(community.price).toFixed(0)}${community.billingInterval === "YEARLY" ? "/yr" : "/mo"}`;

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-ground">
      {/* Topbar */}
      <div className="bg-surface border-b border-divider px-6 py-4 flex items-center gap-4 shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-bold text-sand-500 hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-base font-bold text-ink">{community.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[680px] mx-auto px-4 py-10 flex flex-col gap-6">

          {/* Community card */}
          <div className="bg-surface border border-divider rounded-2xl p-6 flex items-center gap-4 shadow-soft">
            <div className="w-16 h-16 rounded-xl bg-ink flex items-center justify-center shrink-0 text-ground text-2xl font-extrabold overflow-hidden">
              {community.iconUrl ? (
                <img
                  src={community.iconUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                community.name[0]
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">{community.name}</h2>
              <p className="text-sm text-sand-600 mt-0.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {(community.memberCount ?? 0).toLocaleString()} members
              </p>
            </div>
          </div>

          {/* Membership questions */}
          {hasQuestions && (
            <div>
              <h3 className="text-sm font-bold text-sand-700 mb-3 uppercase tracking-wide">
                A few questions before you join
              </h3>
              <div className="bg-surface border border-divider rounded-2xl p-5 shadow-soft flex flex-col gap-4">
                {community.membershipQuestions.map((q) => (
                  <div key={q.id}>
                    <label className="field-label mb-1">
                      {q.question}{" "}
                      {q.isRequired && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      className="input min-h-[80px]"
                      required={q.isRequired}
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      placeholder="Your answer…"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit card */}
          <div className="bg-surface border border-divider rounded-2xl p-6 shadow-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Unauthenticated notice */}
              {sessionStatus === "anonymous" && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  You need an account to join this community.{" "}
                  <button
                    type="button"
                    onClick={() => openModal("signup")}
                    className="font-bold underline"
                  >
                    Sign up or log in
                  </button>
                </p>
              )}

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || sessionStatus === "anonymous"}
                  className="w-full h-12 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[15px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    ctaLabel
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[12px] text-sand-500 pt-1">
                <Shield className="w-3.5 h-3.5" />
                Your information is secure and private
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
