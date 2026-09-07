"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";

import * as auth from "@/lib/mockAuth";
import AuthPageShell from "@/components/auth/AuthPageShell";
import { Button, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState(null);
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    setFormError(null);
    try {
      await auth.forgotPassword({ email });
      setSentTo(email);
    } catch (error) {
      setFormError(error.message);
    }
  };

  if (sentTo) {
    return (
      <AuthPageShell title="Check your email" sub={`We have sent a reset link to ${sentTo}.`}>
        <p className="mt-6 flex items-start gap-3 text-ui bg-sage-100 rounded-inner px-4 py-3">
          <MailCheck className="lucide w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          The link expires in one hour. If it does not arrive, check your spam folder.
        </p>
        <p className="mt-6 text-center">
          <Link href="/login" className="btn btn-ghost">
            Back to log in
          </Link>
        </p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Reset your password"
      sub="Enter your email and we will send you a link."
      footer={
        <Link href="/login" className="btn btn-ghost">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 mt-6">
        {formError ? (
          <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
            {formError}
          </p>
        ) : null}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Enter your email address.",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
          })}
        />
        <Button type="submit" block loading={isSubmitting} className="min-h-12">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
