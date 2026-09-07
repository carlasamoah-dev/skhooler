"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import * as auth from "@/lib/mockAuth";
import AuthPageShell from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui";

export default function VerifyEmailPage({ params }) {
  const { token } = use(params);
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
    return (
      <AuthPageShell title="Email verified" sub="Your account is ready.">
        <p className="mt-6 flex items-start gap-3 text-ui bg-sage-100 rounded-inner px-4 py-3">
          <CheckCircle2 className="lucide w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          Thanks — you can log in now.
        </p>
        <p className="mt-6 text-center">
          <Link href="/login" className="btn btn-primary">
            Log in
          </Link>
        </p>
      </AuthPageShell>
    );
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
