"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import PostDetailClient from "./PostDetailClient";

export default function PostDetailModalClient({ postId }) {
  const router = useRouter();

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="absolute inset-0 z-0" onClick={() => router.back()} />
      <div 
        className="bg-zinc-50 w-full min-h-screen sm:min-h-0 sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col max-w-[900px] relative z-10 overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 right-0 z-20 flex justify-end p-4 pointer-events-none">
          <button 
            className="p-2 bg-white/80 hover:bg-white text-zinc-600 hover:text-zinc-900 rounded-full shadow-sm backdrop-blur transition-all pointer-events-auto" 
            onClick={() => router.back()}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 -mt-14">
          <PostDetailClient postId={postId} inModal />
        </div>
      </div>
    </div>
  );
}
