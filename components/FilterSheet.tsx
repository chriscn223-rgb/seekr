"use client";

import { SearchFilters } from "@/lib/types";
import { CATEGORIES, PLATFORMS } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}

export default function FilterSheet({ open, onClose, filters, onChange }: Props) {
  if (!open) return null;

  const update = (partial: Partial<SearchFilters>) => onChange({ ...filters, ...partial });

  const toggle = (key: "tags" | "platforms", val: string) => {
    const arr = filters[key] || [];
    const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
    update({ [key]: next.length ? next : undefined });
  };

  return (
    <div className="sheet">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-content">
        <div className="flex justify-between items-center mb-5">
          <div className="font-semibold text-lg">More filters</div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-white">Close</button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Platforms */}
          <div>
            <div className="label mb-2">Platforms</div>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const active = (filters.platforms || []).includes(p);
                return (
                  <button key={p} onClick={() => toggle("platforms", p)} 
                    className={`filter-chip ${active ? "active" : ""}`}>{p}</button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="label mb-2">Category</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => update({ category: filters.category === cat ? undefined : cat })}
                  className={`filter-chip ${filters.category === cat ? "active" : ""}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scores & Price */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="label mb-1">Min Popularity</div>
              <input type="range" min={0} max={100} step={5}
                value={filters.minPopularity ?? 0}
                onChange={e => update({ minPopularity: Number(e.target.value) || undefined })}
                className="w-full accent-[#3BF5FF]" />
              <div className="text-right font-mono text-xs text-[#9CA3AF]">{filters.minPopularity || 0}</div>
            </div>
            <div>
              <div className="label mb-1">Min Engagement</div>
              <input type="range" min={0} max={100} step={5}
                value={filters.minEngagement ?? 0}
                onChange={e => update({ minEngagement: Number(e.target.value) || undefined })}
                className="w-full accent-[#3BF5FF]" />
              <div className="text-right font-mono text-xs text-[#9CA3AF]">{filters.minEngagement || 0}</div>
            </div>
            <div>
              <div className="label mb-1">Max subscription price</div>
              <input type="range" min={5} max={55} step={5}
                value={filters.maxPrice ?? 55}
                onChange={e => update({ maxPrice: Number(e.target.value) })}
                className="w-full accent-[#3BF5FF]" />
              <div className="text-right font-mono text-xs text-[#9CA3AF]">${filters.maxPrice || "—"}</div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex gap-2">
          <button onClick={() => onChange({ query: filters.query, sort: filters.sort })} className="btn-ghost flex-1">
            Clear filters
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
