"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView); // "login", "signup", "forgot"
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Forgot password success state
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === "forgot") {
      setResetSent(true);
    } else {
      console.log(`Submitted ${view}`, { email, password, firstName, lastName });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center text-[36px] font-bold tracking-tighter text-black mb-6">
          skhooler
        </div>

        {view === "login" && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Welcome back</h2>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <input 
                type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]"
              />
              <div className="relative">
                <input 
                  type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]"
                />
                <button type="button" onClick={() => setView("forgot")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-500 hover:text-brand-primary">
                  Forgot?
                </button>
              </div>
              <button type="submit" className="w-full h-12 bg-brand-primary hover:bg-brand-hover text-white font-bold text-[15px] rounded-xl transition-all shadow-md shadow-brand-primary/20 mt-2">
                LOG IN
              </button>
            </form>
            <div className="mt-8 text-[14px] text-gray-600 font-medium">
              Don't have an account? <button onClick={() => setView("signup")} className="text-brand-primary hover:underline font-semibold ml-1">Sign up</button>
            </div>
          </>
        )}

        {view === "signup" && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create an account</h2>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <input 
                type="text" placeholder="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]"
              />
              <input 
                type="text" placeholder="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]"
              />
              <input 
                type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]"
              />
              <input 
                type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]"
              />
              <button type="submit" className="w-full h-12 bg-brand-primary hover:bg-brand-hover text-white font-bold text-[15px] rounded-xl transition-all shadow-md shadow-brand-primary/20 mt-2">
                SIGN UP
              </button>
            </form>
            <div className="mt-8 text-[14px] text-gray-600 font-medium">
              Already have an account? <button onClick={() => setView("login")} className="text-brand-primary hover:underline font-semibold ml-1">Log in</button>
            </div>
          </>
        )}

        {view === "forgot" && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
            {resetSent ? (
              <div className="text-center mt-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  We have sent a password reset link to <strong>{email}</strong> with instructions on how to reset your password.
                </p>
                <button onClick={() => setView("login")} className="mt-6 w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[15px] rounded-xl transition-colors">
                  Back to login
                </button>
              </div>
            ) : (
              <>
                <p className="text-[14px] text-gray-500 text-center mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <input 
                    type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-[15px]"
                  />
                  <button type="submit" className="w-full h-12 bg-brand-primary hover:bg-brand-hover text-white font-bold text-[15px] rounded-xl transition-all shadow-md shadow-brand-primary/20 mt-2">
                    SEND RESET LINK
                  </button>
                </form>
                <button onClick={() => setView("login")} className="mt-6 text-[14px] text-gray-500 hover:text-gray-800 font-medium transition-colors">
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
