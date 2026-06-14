"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, SlidersHorizontal } from "lucide-react";
import { getAutocompleteSuggestions } from "@/lib/search";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  onNearMe?: () => void;
  onAdvanced?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function SearchBar({ 
  value, 
  onChange, 
  onSubmit, 
  onNearMe, 
  onAdvanced,
  placeholder = "Search by name, username, niche, or city…", 
  autoFocus,
  inputRef: externalInputRef
}: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (value.trim().length >= 1) {
        const res = await getAutocompleteSuggestions(value, 7);
        setSuggestions(res);
        setOpen(true);
        setActiveIndex(-1);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    }, 85);
    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter" && onSubmit) onSubmit();
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        const s = suggestions[activeIndex];
        onChange(s.display_name || s.username);
        setOpen(false);
        onSubmit?.();
      } else {
        onSubmit?.();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const pickSuggestion = (s: any) => {
    onChange(s.display_name);
    setOpen(false);
    setSuggestions([]);
    onSubmit?.();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="search-bar group">
        <Search className="w-4 h-4 text-[#7B849C] group-focus-within:text-[#F0A500] transition-colors flex-shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value && suggestions.length && setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="search-input"
        />

        {value && (
          <button
            onClick={() => { onChange(""); setOpen(false); inputRef.current?.focus(); }}
            className="mr-1 text-[#7B849C] hover:text-[#EDF0F8] text-lg leading-none"
          >
            ×
          </button>
        )}

        {/* Right action pills (compact) */}
        <div className="search-actions pr-1">
          <button onClick={onNearMe} className="chip text-[11px] h-7 px-3">Near me</button>
          <button onClick={onAdvanced} className="chip text-[11px] h-7 px-3">Advanced</button>
          <button onClick={onSubmit} className="search-btn text-xs">Search</button>
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-[60] mt-1.5 w-full bg-[#0C1020] border border-[#1F2937] rounded-2xl shadow-2xl py-1 overflow-hidden">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => pickSuggestion(s)}
              data-active={idx === activeIndex}
              className="autocomplete-item w-full text-left px-5 py-2.5 flex items-center justify-between text-sm"
            >
              <div>
                <span className="font-medium">{s.display_name}</span>
                <span className="ml-2 text-[#9CA3AF]">@{s.username}</span>
              </div>
              <span className="text-[10px] px-2 py-px rounded bg-[#111827] text-[#3BF5FF]">{s.category}</span>
            </button>
          ))}
          <div className="px-5 pt-1 pb-1 text-[10px] text-[#9CA3AF] border-t border-[#1F2937]">Press Enter to search</div>
        </div>
      )}
    </div>
  );
}
