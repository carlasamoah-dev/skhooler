"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login with", email, password);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-12">
      <div className="w-full max-w-[400px] bg-surface rounded-xl shadow-soft border border-divider p-8 flex flex-col items-center">
        
        <div className="flex items-center text-[40px] font-bold tracking-tighter text-ink mb-6">
          skhooler
        </div>

        <h1 className="text-2xl font-bold text-ink mb-8">Log in</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-sand-100 border border-divider rounded-md text-ink placeholder:text-sand-700 focus:outline-none focus:border-brand focus:bg-surface transition-colors text-[15px]"
            />
          </div>

          <div className="relative">
            <input 
              type="password" 
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-sand-100 border border-divider rounded-md text-ink placeholder:text-sand-700 focus:outline-none focus:border-brand focus:bg-surface transition-colors text-[15px]"
            />
            <Link href="#" className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-sand-700 hover:text-ink">
              Forgot?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full h-12 bg-brand hover:bg-brand-600 text-ground font-bold text-[15px] rounded-md transition-colors mt-2"
          >
            LOG IN
          </button>
        </form>

        <div className="mt-8 text-[14px] text-sand-700 font-medium">
          Don&apos;t have an account? <Link href="/signup" className="text-brand-700 hover:underline font-semibold">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
