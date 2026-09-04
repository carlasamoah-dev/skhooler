import Link from "next/link";
import { Globe } from "lucide-react";

export default function GlobalNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-1">
        <Link href="/discover" className="flex items-center text-3xl font-bold tracking-tighter text-black">
          skhooler
        </Link>
        <div className="ml-1 flex flex-col justify-center -space-y-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path></svg>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Globe className="w-5 h-5" />
        </button>
        <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded px-4 py-1.5 transition-colors">
          LOG IN
        </Link>
      </div>
    </nav>
  );
}
