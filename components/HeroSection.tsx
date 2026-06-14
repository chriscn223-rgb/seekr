"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import { MapPin, SlidersHorizontal } from "lucide-react";

interface HeroProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearchSubmit?: () => void;
  onNearMe: () => void;
  onAdvanced: () => void;
  creatorCount?: number;
  responseTime?: number;
}

export default function HeroSection({
  query,
  onQueryChange,
  onSearchSubmit,
  onNearMe,
  onAdvanced,
  creatorCount = 148,
  responseTime = 0.18,
}: HeroProps) {
  return (
    <div className="container pt-10 pb-8 text-center">
      <div className="label tracking-[2px] mb-2 text-[#3BF5FF]">CREATOR SEARCH ENGINE</div>

      <h1 className="h1 mb-3">Find real creators,<br />instantly.</h1>
      
      <p className="max-w-md mx-auto text-[#9CA3AF] text-[15px]">
        Search across platforms, niches, and locations.<br />No ads. No logins.
      </p>

      <div className="mt-7 max-w-[620px] mx-auto" id="search">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          onSubmit={onSearchSubmit}
          onNearMe={onNearMe}
          onAdvanced={onAdvanced}
        />

        <div className="search-status">
          <div>
            <span className="font-mono">{creatorCount}</span> creators indexed • <span className="text-[#3BF5FF]">FAST</span> search
          </div>
          <div className="flex items-center gap-1.5">
            <span className="status-dot" /> 
            &lt; {responseTime}s avg
          </div>
        </div>
      </div>
    </div>
  );
}
