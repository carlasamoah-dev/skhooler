"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";

import { Button, Input } from "@/components/ui";
import * as auth from "@/lib/auth";

// Inline wrapper for consistent call shape
function authCall(mode, values) {
  return mode === "signup" ? auth.register(values) : auth.login(values);
}

export const COPY = {
  login: {
    title: "Log in",
    cta: "Log in",
    footer: "New to Skhooler?",
    switchLabel: "Create an account",
    switchTo: "signup",
  },
  signup: {
    title: "Create your account",
    cta: "Create account",
    footer: "Already have an account?",
    switchLabel: "Log in",
    switchTo: "login",
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthForm({ mode, onSuccess, onSwitch, switchAs }) {
  const copy = COPY[mode];
  const [formError, setFormError] = useState(null);
  const [waitingVerification, setWaitingVerification] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onSubmit" });

  useEffect(() => {
    let intervalId;
    if (waitingVerification) {
      intervalId = setInterval(async () => {
        try {
          const { user } = await auth.me();
          if (user && user.isEmailVerified) {
            clearInterval(intervalId);
            setWaitingVerification("verified_please_login");
          }
        } catch (error) {
          // Keep waiting
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [waitingVerification]);

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      const { user } = await authCall(mode, values);
      if (mode === "signup" && !user.isEmailVerified) {
        setWaitingVerification(true);
      } else {
        onSuccess?.(user);
      }
    } catch (error) {
      setFormError(error.message ?? "Something went wrong. Please try again.");
    }
  };

  const handleSwitch = (newMode) => {
    setFormError(null);
    onSwitch?.(newMode);
  };

  if (waitingVerification === "verified_please_login") {
    return (
      <div className="flex flex-col gap-6 mt-6">
        <p className="text-ui bg-sage-100 rounded-inner px-4 py-3 flex items-start gap-3">
          <MailCheck className="lucide w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          Email has been verified. Please sign in again.
        </p>
        <Button onClick={() => { setWaitingVerification(false); handleSwitch("login"); }} block>
          Log in
        </Button>
      </div>
    );
  }

  if (waitingVerification) {
    return (
      <div className="flex flex-col gap-6 mt-6">
        <p className="text-ui bg-sage-100 rounded-inner px-4 py-3 flex items-start gap-3">
          <MailCheck className="lucide w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          We've sent a verification link to your email. Please click it to verify your account.
        </p>
        <p className="text-center text-ui text-sand-700">
          Waiting for verification...
        </p>
      </div>
    );
  }

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
          <button type="button" onClick={() => handleSwitch(copy.switchTo)} className="btn btn-ghost">
            {copy.switchLabel}
          </button>
        ) : (
          switchAs
        )}
      </p>
    </form>
  );
}
