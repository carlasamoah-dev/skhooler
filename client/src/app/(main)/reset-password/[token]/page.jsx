"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import * as auth from "@/lib/auth";
import AuthPageShell from "@/components/auth/AuthPageShell";
import { Button, Input } from "@/components/ui";

export default function ResetPasswordPage({ params }) {
  const { token } = use(params);
  const router = useRouter();
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ password }) => {
    setFormError(null);
    try {
      await auth.resetPassword({ token, password });
      router.push("/login");
    } catch (error) {
      if (error.fieldErrors?.password) {
        setError("password", { type: "server", message: error.fieldErrors.password });
        return;
      }
      setFormError(error.message);
    }
  };

  return (
    <AuthPageShell
      title="Choose a new password"
      sub="Make it at least 8 characters."
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
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password", {
            required: "Enter a new password.",
            minLength: { value: 8, message: "Password must be at least 8 characters." },
          })}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm", {
            required: "Type the password again.",
            validate: (v) => v === getValues("password") || "Those passwords do not match.",
          })}
        />
        <Button type="submit" block loading={isSubmitting} className="min-h-12">
          {isSubmitting ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
