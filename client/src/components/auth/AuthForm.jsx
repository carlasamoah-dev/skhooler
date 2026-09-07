"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Input } from "@/components/ui";
import * as mockAuth from "@/lib/mockAuth";

// Inline wrapper for consistent call shape
function mockAuthCall(mode, values) {
  return mode === "signup" ? mockAuth.register(values) : mockAuth.login(values);
}

export const COPY = {
  login: {
    title: "Log in",
    sub: "Welcome back to Remote Jobs HQ.",
    cta: "Log in",
    footer: "New to Skhooler?",
    switchLabel: "Create an account",
    switchTo: "signup",
  },
  signup: {
    title: "Create your account",
    sub: "Join Remote Jobs HQ — free.",
    cta: "Create account",
    footer: "Already have an account?",
    switchLabel: "Log in",
    switchTo: "login",
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shared by the dialog and the standalone /login and /signup pages.
 * `onSwitch` is omitted on the standalone pages, which link instead.
 */
export default function AuthForm({ mode, onSuccess, onSwitch, switchAs }) {
  const copy = COPY[mode];
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onSubmit" });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      const { user } = await mockAuthCall(mode, values);
      onSuccess?.(user);
    } catch (error) {
      setFormError(error.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 mt-6">
      {formError ? (
        <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
          {formError}
        </p>
      ) : null}

      {mode === "signup" ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName", { required: "Enter your first name." })}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName", { required: "Enter your last name." })}
          />
        </div>
      ) : null}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email", {
          required: "Enter your email address.",
          pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address." },
        })}
      />

      <Input
        label="Password"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        error={errors.password?.message}
        {...register("password", {
          required: "Enter your password.",
          minLength: { value: 8, message: "Password must be at least 8 characters." },
        })}
      />

      <Button type="submit" block loading={isSubmitting} className="min-h-12">
        {isSubmitting ? "Working…" : copy.cta}
      </Button>

      <p className="text-ui text-sand-700 text-center">
        {copy.footer}{" "}
        {onSwitch ? (
          <button type="button" onClick={() => onSwitch(copy.switchTo)} className="btn btn-ghost">
            {copy.switchLabel}
          </button>
        ) : (
          switchAs
        )}
      </p>
    </form>
  );
}
