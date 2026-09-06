"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup with", { firstName, lastName, email, password });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-12">
      <div className="w-full max-w-[400px] bg-surface rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-app-border p-8 flex flex-col items-center">
        
        <div className="flex items-center text-[40px] font-bold tracking-tighter text-app-fg mb-6">
          skhooler
        </div>

        <h1 className="text-2xl font-bold text-app-fg mb-8">Sign up</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-12 px-4 bg-surface-muted border border-app-border rounded-md text-app-fg placeholder:text-muted-fg focus:outline-none focus:border-brand-primary focus:bg-surface transition-colors text-[15px]"
            />
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-12 px-4 bg-surface-muted border border-app-border rounded-md text-app-fg placeholder:text-muted-fg focus:outline-none focus:border-brand-primary focus:bg-surface transition-colors text-[15px]"
            />
          </div>

          <div>
            <input 
              type="email" 
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-surface-muted border border-app-border rounded-md text-app-fg placeholder:text-muted-fg focus:outline-none focus:border-brand-primary focus:bg-surface transition-colors text-[15px]"
            />
          </div>

          <div>
            <input 
              type="password" 
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-surface-muted border border-app-border rounded-md text-app-fg placeholder:text-muted-fg focus:outline-none focus:border-brand-primary focus:bg-surface transition-colors text-[15px]"
            />
          </div>

          <button 
            type="submit" 
            className="w-full h-12 bg-brand-primary hover:bg-brand-hover text-on-brand font-bold text-[15px] rounded-md transition-colors mt-2"
          >
            SIGN UP
          </button>
        </form>

        <div className="mt-8 text-[14px] text-muted-fg font-medium">
          Already have an account? <Link href="/login" className="text-brand-accent hover:underline font-semibold">Log in</Link>
        </div>
      </div>
    </div>
  );
}
