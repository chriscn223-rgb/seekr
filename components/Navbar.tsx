"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#1F2937] bg-[#05060A]/95 backdrop-blur">
      <div className="container h-12 flex items-center justify-between text-sm">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-md bg-[#3BF5FF] text-[#05060A] flex items-center justify-center">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="font-semibold tracking-[-0.3px] text-base">seekr</div>
        </Link>

        <div className="flex items-center gap-1.5 text-sm">
          <a href="#results" className="px-3 py-1 rounded-full hover:bg-[#111827] text-[#E5E7EB] transition">Search</a>
          <Link href="/about" className="px-3 py-1 rounded-full hover:bg-[#111827] text-[#E5E7EB] transition">About</Link>
          <Link 
            href="/submit" 
            className="ml-2 px-4 py-1 rounded-full bg-[#3BF5FF] text-[#05060A] font-medium hover:bg-[#2BE0E8] transition text-xs tracking-wide"
          >
            Submit profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
