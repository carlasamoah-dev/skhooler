"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthForm, { COPY } from "@/components/auth/AuthForm";
import AuthPageShell from "@/components/auth/AuthPageShell";
import { useSessionStore } from "@/store/useSessionStore";

export default function SignupPage() {
  const router = useRouter();
  const bootstrap = useSessionStore((s) => s.bootstrap);

  return (
    <AuthPageShell title={COPY.signup.title} sub={COPY.signup.sub}>
      <AuthForm
        mode="signup"
        onSuccess={async () => {
          await bootstrap();
          router.push("/home");
        }}
        switchAs={
          <Link href="/login" className="btn btn-ghost">
            Log in
          </Link>
        }
      />
    </AuthPageShell>
  );
}
