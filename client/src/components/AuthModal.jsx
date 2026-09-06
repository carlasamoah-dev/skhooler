"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const inputClass =
  "w-full h-12 px-4 bg-surface-muted border border-app-border rounded-xl text-app-fg placeholder:text-muted-fg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]";

const submitClass =
  "w-full h-12 bg-brand-primary hover:bg-brand-hover text-on-brand font-bold text-[15px] rounded-xl transition-all shadow-md shadow-brand-primary/20 mt-2";

export default function AuthModal({ onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView); // "login", "signup", "forgot"
  const panelRef = useRef(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Forgot password success state
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === "forgot") {
      setResetSent(true);
    } else {
      console.log(`Submitted ${view}`, { email, password, firstName, lastName });
    }
  };

  // Close on a click that both starts and ends on the backdrop, so a drag that
  // began inside the panel does not dismiss it.
  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const heading =
    view === "login" ? "Welcome back" : view === "signup" ? "Create an account" : "Reset Password";

  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      className="skhooler-overlay-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        tabIndex={-1}
        className="skhooler-panel-in relative w-full max-w-[420px] bg-surface rounded-2xl shadow-2xl border border-app-border p-8 flex flex-col items-center outline-none"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-fg hover:text-app-fg transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center text-[36px] font-bold tracking-tighter text-app-fg mb-6">
          skhooler
        </div>

        {view === "login" && (
          <>
            <h2 className="text-xl font-bold text-app-fg mb-6">{heading}</h2>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <input
                type="email" placeholder="Email" aria-label="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <div className="relative">
                <input
                  type="password" placeholder="Password" aria-label="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <button type="button" onClick={() => setView("forgot")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted-fg hover:text-app-fg">
                  Forgot?
                </button>
              </div>
              <button type="submit" className={submitClass}>
                LOG IN
              </button>
            </form>
            <div className="mt-8 text-[14px] text-muted-fg font-medium">
              Don&apos;t have an account? <button onClick={() => setView("signup")} className="text-brand-accent hover:underline font-semibold ml-1">Sign up</button>
            </div>
          </>
        )}

        {view === "signup" && (
          <>
            <h2 className="text-xl font-bold text-app-fg mb-6">{heading}</h2>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <input
                type="text" placeholder="First Name" aria-label="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
              <input
                type="text" placeholder="Last Name" aria-label="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
              <input
                type="email" placeholder="Email" aria-label="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <input
                type="password" placeholder="Password" aria-label="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <button type="submit" className={submitClass}>
                SIGN UP
              </button>
            </form>
            <div className="mt-8 text-[14px] text-muted-fg font-medium">
              Already have an account? <button onClick={() => setView("login")} className="text-brand-accent hover:underline font-semibold ml-1">Log in</button>
            </div>
          </>
        )}

        {view === "forgot" && (
          <>
            <h2 className="text-xl font-bold text-app-fg mb-2">{heading}</h2>
            {resetSent ? (
              <div className="text-center mt-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-[15px] text-app-fg leading-relaxed">
                  We have sent a password reset link to <strong>{email}</strong> with instructions on how to reset your password.
                </p>
                <button onClick={() => setView("login")} className="mt-6 w-full h-12 bg-surface-muted hover:bg-app-border text-app-fg font-bold text-[15px] rounded-xl transition-colors">
                  Back to login
                </button>
              </div>
            ) : (
              <>
                <p className="text-[14px] text-muted-fg text-center mb-6">Enter your email address and we&apos;ll send you a link to reset your password.</p>
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <input
                    type="email" placeholder="Email address" aria-label="Email address" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <button type="submit" className={submitClass}>
                    SEND RESET LINK
                  </button>
                </form>
                <button onClick={() => setView("login")} className="mt-6 text-[14px] text-muted-fg hover:text-app-fg font-medium transition-colors">
                  Nevermind, back to login
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
