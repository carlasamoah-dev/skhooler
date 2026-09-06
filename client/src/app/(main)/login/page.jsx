"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import AuthForm, { COPY } from "@/components/auth/AuthForm";
import AuthPageShell from "@/components/auth/AuthPageShell";

/** Split out so `useSearchParams` has a Suspense boundary to bail out to. */
function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");

  return (
    <AuthForm
      mode="login"
      onSuccess={() => router.push(next || "/remote-jobs-hq/community")}
      switchAs={
        <Link href="/signup" className="btn btn-ghost">
          Create an account
        </Link>
      }
    />
  );
}

export default function LoginPage() {
  return (
    <AuthPageShell title={COPY.login.title} sub={COPY.login.sub}>
      <Suspense fallback={<div className="mt-6 h-[280px]" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-ui text-center">
        <Link href="/forgot-password" className="btn btn-ghost">
          Forgot your password?
        </Link>
      </p>
    </AuthPageShell>
  );
}
