"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="nav sticky top-0 z-50 flex items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3 group">
        {/* Custom radar-sweep wordmark logo */}
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <path d="M4 18 L24 18" stroke="#EDF0F8" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7 4 Q14 2 21 4" stroke="#EDF0F8" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          {/* Radar arc in the 'e' position - amber accent */}
          <path d="M12.5 6 Q15.5 4 18.5 6" stroke="#F0A500" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="15.5" cy="5" r="1.2" fill="#F0A500"/>
        </svg>
        <span className="font-display text-[21px] font-extrabold tracking-[-1.5px] text-[#EDF0F8] group-hover:text-white transition">seekr</span>
      </Link>

      <div className="flex items-center gap-5 text-sm">
        <a href="#results" className="nav-link">Search</a>
        <Link href="/about" className="nav-link">About</Link>
        <Link href="/api" className="nav-link">API</Link>
        <Link 
          href="/submit" 
          className="btn btn-primary text-xs tracking-[0.5px] h-8 px-4"
        >
          Submit profile ↗
        </Link>
      </div>
    </nav>
  );
}
