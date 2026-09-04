import Link from "next/link";

export default function CommunityNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-serif text-[10px] leading-tight text-center italic font-bold">
            Maker<br/>School.
          </div>
          <span className="text-[17px] font-bold text-gray-900 group-hover:underline">Maker School: AI Automation</span>
        </Link>
        <div className="flex flex-col justify-center -space-y-1 ml-1 cursor-pointer">
          <svg className="w-[10px] h-[10px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path></svg>
          <svg className="w-[10px] h-[10px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-[13px] font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-sm px-5 py-2 transition-colors">
          LOG IN
        </Link>
      </div>
    </nav>
  );
}
