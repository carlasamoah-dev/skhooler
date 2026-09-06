"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthForm, { COPY } from "@/components/auth/AuthForm";
import AuthPageShell from "@/components/auth/AuthPageShell";

export default function SignupPage() {
  const router = useRouter();

  return (
    <AuthPageShell title={COPY.signup.title} sub={COPY.signup.sub}>
      <AuthForm
        mode="signup"
        onSuccess={() => router.push("/remote-jobs-hq/community")}
        switchAs={
          <Link href="/login" className="btn btn-ghost">
            Log in
          </Link>
        }
      />
    </AuthPageShell>
  );
}
