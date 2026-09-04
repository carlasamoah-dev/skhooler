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
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 p-8 flex flex-col items-center">
        
        <div className="flex items-center text-[40px] font-bold tracking-tighter text-black mb-6">
          skhooler
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Log in</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:bg-white transition-colors text-[15px]"
            />
          </div>

          <div className="relative">
            <input 
              type="password" 
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:bg-white transition-colors text-[15px]"
            />
            <Link href="#" className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-500 hover:text-gray-800">
              Forgot?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full h-12 bg-skool-yellow hover:bg-skool-yellow-hover text-gray-900 font-bold text-[15px] rounded-md transition-colors mt-2"
          >
            LOG IN
          </button>
        </form>

        <div className="mt-8 text-[14px] text-gray-600 font-medium">
          Don't have an account? <Link href="/signup" className="text-skool-blue hover:underline font-semibold">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
