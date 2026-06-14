"use client";

import { SearchFilters } from "@/lib/types";
import { CATEGORIES, PLATFORMS } from "@/lib/constants";
import { useState } from "react";

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onMoreFilters: () => void;
  total: number;
  tookMs: number;
}

export default function FilterBar({ filters, onChange, onMoreFilters, total, tookMs }: Props) {
  const togglePlatform = (p: string) => {
    const current = filters.platforms || [];
    const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    onChange({ ...filters, platforms: next.length ? next : undefined });
  };

  const setCategory = (cat?: string) => {
    onChange({ ...filters, category: cat });
  };

  const setSort = (sort: SearchFilters["sort"]) => {
    onChange({ ...filters, sort });
  };

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className={`filter-bar flex-1 min-w-[280px] ${filters.lat ? 'sticky-lifted' : ''}`}>
        {/* Platforms quick multi */}
        {PLATFORMS.slice(0, 5).map(p => {
          const active = (filters.platforms || []).includes(p);
          return (
            <button 
              key={p} 
              onClick={() => togglePlatform(p)} 
              className={`filter-chip ${active ? "active" : ""}`}
            >
              {p}
            </button>
          );
        })}

        {/* Category quick */}
        <select 
          value={filters.category || ""} 
          onChange={(e) => setCategory(e.target.value || undefined)}
          className="filter-chip bg-transparent border-[#1F2937] text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Price quick */}
        <button 
          onClick={() => onChange({ ...filters, maxPrice: filters.maxPrice ? undefined : 25 })} 
          className={`filter-chip ${filters.maxPrice ? "active" : ""}`}
        >
          {filters.maxPrice ? `≤$${filters.maxPrice}` : "Price"}
        </button>

        <button onClick={onMoreFilters} className="btn-more ml-1">More filters</button>
      </div>

      {/* Sort + meta */}
      <div className="flex items-center gap-3">
        <select 
          value={filters.sort || "relevance"} 
          onChange={(e) => setSort(e.target.value as any)} 
          className="sort-select"
        >
          <option value="relevance">Relevance</option>
          <option value="popularity">Popularity</option>
          <option value="engagement">Engagement</option>
          <option value="newest">Newest</option>
          <option value="price">Price</option>
          <option value="distance">Distance</option>
        </select>

        <div className="text-xs text-[#7B849C] font-mono tabular-nums hidden sm:block">
          {total} results • {tookMs}ms
        </div>
      </div>
    </div>
  );
}
