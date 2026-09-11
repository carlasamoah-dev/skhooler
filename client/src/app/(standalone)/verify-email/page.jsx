"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import * as auth from "@/lib/auth";
import AuthPageShell from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState({ status: "verifying", message: null });
  const [resent, setResent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    auth
      .verifyEmail({ token })
      .then(() => !cancelled && setState({ status: "verified", message: null }))
      .catch((error) => !cancelled && setState({ status: "failed", message: error.message }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.status === "verifying") {
    return <AuthPageShell title="Verifying your email" sub="One moment." />;
  }

  if (state.status === "verified") {
    return <VerifiedSuccess />;
  }

  return (
    <AuthPageShell title="That link did not work" sub={state.message}>
      <p className="mt-6 flex items-start gap-3 text-ui bg-brand-50 rounded-inner px-4 py-3">
        <TriangleAlert className="lucide w-5 h-5 shrink-0 mt-0.5 text-alert" aria-hidden="true" />
        Verification links expire after 24 hours. Send yourself a fresh one.
      </p>
      <Button
        block
        className="mt-6 min-h-12"
        disabled={resent}
        onClick={() => auth.resendVerification({ email: "" }).finally(() => setResent(true))}
      >
        {resent ? "Sent — check your inbox" : "Send a new link"}
      </Button>
    </AuthPageShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthPageShell title="Verifying your email" sub="One moment." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifiedSuccess() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AuthPageShell title="Email verified" sub="Your account is ready.">
      <p className="mt-6 flex items-start gap-3 text-ui bg-sage-100 rounded-inner px-4 py-3">
        <CheckCircle2 className="lucide w-5 h-5 shrink-0 mt-0.5 text-sage-700" aria-hidden="true" />
        <span className="text-sage-900">Email has been verified and updated. Redirecting to login...</span>
      </p>
      <p className="mt-6 text-center">
        <Link href="/login" className="btn btn-primary">
          Log in now
        </Link>
      </p>
    </AuthPageShell>
  );
}
