"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import FilterSheet from "@/components/FilterSheet";
import CreatorCard from "@/components/CreatorCard";
import ViewToggle from "@/components/ViewToggle";
import MapView from "@/components/MapView";
import { searchCreators, getCategoryCounts } from "@/lib/search";
import { SearchFilters, RankedCreator, SearchResponse } from "@/lib/types";
import { X, Search } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 30;

export default function SeekrSearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core state
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    tags: searchParams.getAll("tag").length ? searchParams.getAll("tag") : undefined,
    platforms: searchParams.getAll("platform").length ? searchParams.getAll("platform") : undefined,
    minPopularity: searchParams.get("pop") ? Number(searchParams.get("pop")) : undefined,
    minEngagement: searchParams.get("eng") ? Number(searchParams.get("eng")) : undefined,
    maxPrice: searchParams.get("price") ? Number(searchParams.get("price")) : undefined,
    minSignal: searchParams.get("signal") ? Number(searchParams.get("signal")) : undefined,
    sort: (searchParams.get("sort") as any) || "relevance",
    lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined,
    radiusKm: searchParams.get("radius") ? Number(searchParams.get("radius")) : undefined,
    hideNsfw: searchParams.get("hideNsfw") === "true",
  }));

  const [view, setView] = useState<"grid" | "map">((searchParams.get("view") as any) || "grid");
  const [results, setResults] = useState<RankedCreator[]>([]);
  const [total, setTotal] = useState(0);
  const [tookMs, setTookMs] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // UI sheets
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Data for chips
  const [categories] = useState(() => getCategoryCounts().slice(0, 8));

  // URL sync (lightweight)
  const updateURL = (f: SearchFilters, v?: "grid" | "map") => {
    const p = new URLSearchParams();
    if (f.query) p.set("q", f.query);
    if (f.category) p.set("category", f.category);
    (f.platforms || []).forEach(pl => p.append("platform", pl));
    if (f.sort && f.sort !== "relevance") p.set("sort", f.sort);
    if (f.lat) p.set("lat", String(f.lat));
    if (f.lng) p.set("lng", String(f.lng));
    if (f.radiusKm) p.set("radius", String(f.radiusKm));
    if (v && v !== "grid") p.set("view", v);
    router.replace(p.toString() ? `/?${p}` : "/", { scroll: false });
  };

  const setFiltersAndSync = (nf: SearchFilters, nv?: "grid" | "map") => {
    setFilters(nf);
    setSelectedId(undefined);
    updateURL(nf, nv ?? view);
  };

  // Search runner
  async function runSearch(f: SearchFilters) {
    setLoading(true);
    try {
      const res: SearchResponse = await searchCreators(f);
      setResults(res.results);
      setTotal(res.total);
      setTookMs(res.tookMs);
      setPage(1);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  // Initial + reactive search
  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Visible results
  const visible = useMemo(() => results.slice(0, page * PAGE_SIZE), [results, page]);
  const hasMore = visible.length < total;

  // Handlers
  const handleQuery = (q: string) => setFiltersAndSync({ ...filters, query: q || undefined });
  const handleNearMe = () => {
    if (!navigator.geolocation) return toast.error("Location unavailable");
    navigator.geolocation.getCurrentPosition(pos => {
      const nf = { ...filters, lat: pos.coords.latitude, lng: pos.coords.longitude, radiusKm: 90 };
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setFiltersAndSync(nf);
      setView("map");
      toast.success("Showing creators near you");
    }, () => toast.error("Could not get your location"));
  };
  const handleAdvanced = () => setShowFilterSheet(true);
  const toggleView = (v: "grid" | "map") => { setView(v); updateURL(filters, v); };
  const clearLocation = () => {
    const nf = { ...filters }; delete nf.lat; delete nf.lng; delete nf.radiusKm;
    setUserLocation(null); setFiltersAndSync(nf);
  };

  // Map <-> Card sync
  const handleCardSelect = (c: RankedCreator) => {
    setSelectedId(c.id);
    if (view === "map") {
      // If on map, scroll the card list into view (if it exists) or just stay
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // switch to map and center roughly
      setView("map");
      updateURL(filters, "map");
    }
  };

  const handleMarkerSelect = (c: RankedCreator) => {
    setSelectedId(c.id);
    // Highlight corresponding card by scrolling the results area
    const el = document.getElementById(`card-${c.id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("!ring-2", "!ring-[#3BF5FF]");
      setTimeout(() => el.classList.remove("!ring-2", "!ring-[#3BF5FF]"), 1400);
    }
  };

  // Mobile quick search overlay
  const MobileSearchOverlay = showMobileSearch && (
    <div className="fixed inset-0 z-[80] bg-[#05060A] p-4">
      <div className="flex justify-between mb-3">
        <div className="font-semibold">Search creators</div>
        <button onClick={() => setShowMobileSearch(false)}>Close</button>
      </div>
      <SearchBar
        value={filters.query || ""}
        onChange={handleQuery}
        onSubmit={() => setShowMobileSearch(false)}
        onNearMe={handleNearMe}
        onAdvanced={handleAdvanced}
        autoFocus
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#05060A]">
      <Navbar />

      {/* Compact premium hero band integrated into results (per spec) */}
      <div className="container pt-6 pb-4 border-b border-[#1F2937]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="label tracking-[2px] text-[#3BF5FF] mb-1">CREATOR SEARCH ENGINE</div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-[-1.5px]">Search creators across platforms—instantly.</h1>
            <p className="text-[#9CA3AF] mt-1">No content. No logins. Just profiles.</p>
          </div>
          <div className="text-right text-sm text-[#9CA3AF] font-mono">
            23,418 creators • 71 countries • &lt; 200 ms search
          </div>
        </div>
      </div>

      {/* Dominant search bar (premium search engine feel) */}
      <div className="container pt-5">
        <div className="max-w-3xl mx-auto">
          <SearchBar
            value={filters.query || ""}
            onChange={handleQuery}
            onSubmit={() => runSearch(filters)}
            onNearMe={handleNearMe}
            onAdvanced={handleAdvanced}
          />
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] mt-2 px-1">
            <div>
              Showing <span className="font-mono text-[#F9FAFB]">{total}</span> creators • Sorted by {filters.sort || "relevance"} • {tookMs}ms
            </div>
            <div className="hidden sm:flex gap-2 text-[11px]">
              <span className="px-2 py-0.5 bg-[#111827] rounded">Trending this week</span>
              <span className="px-2 py-0.5 bg-[#111827] rounded">Top under $10</span>
              <span className="px-2 py-0.5 bg-[#111827] rounded">Cosplay • LA</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR + CONTROLS (horizontal, clean) */}
      <div className="container pt-2 pb-4 sticky top-14 z-40 bg-[#05060A]/95 backdrop-blur border-b border-[#1F2937]">
        <div className="flex items-center gap-3 justify-between">
          <FilterBar 
            filters={filters} 
            onChange={setFiltersAndSync} 
            onMoreFilters={() => setShowFilterSheet(true)} 
            total={total} 
            tookMs={tookMs} 
          />

          <div className="flex items-center gap-3">
            {filters.lat && (
              <button onClick={clearLocation} className="text-xs flex items-center gap-1 text-[#F97373] hover:underline">
                <X className="w-3.5 h-3.5"/> Clear location
              </button>
            )}
            <ViewToggle view={view} onChange={toggleView} />
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="container pt-5 flex items-baseline justify-between" id="results">
        <div>
          <span className="font-semibold text-xl tracking-tight">
            {filters.query ? "Search results" : "All creators"}
          </span>
          <span className="ml-3 text-sm text-[#9CA3AF] font-mono">{total} indexed • {tookMs}ms</span>
        </div>

        {view === "grid" && (
          <button 
            onClick={() => setShowMobileSearch(true)} 
            className="sm:hidden flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F2937] text-sm"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        )}
      </div>

      {/* RESULTS / MAP AREA */}
      <div className="container pb-16 flex-1 pt-4">
        {view === "grid" ? (
          <>
            {loading && visible.length === 0 ? (
              <div className="results-grid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card h-[310px] skeleton" />
                ))}
              </div>
            ) : visible.length > 0 ? (
              <div className="results-grid">
                {visible.map((creator) => (
                  <div id={`card-${creator.id}`} key={creator.id}>
                    <CreatorCard 
                      creator={creator} 
                      isSelected={selectedId === creator.id}
                      onCardClick={handleCardSelect}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-[#9CA3AF]">
                No creators match your search.<br />
                <span className="text-xs">Try a broader niche or clear some filters.</span>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={() => setPage(p => p + 1)} className="btn-ghost px-8">
                  Load more
                </button>
              </div>
            )}
          </>
        ) : (
          <div>
            <MapView
              creators={results}
              center={userLocation || (filters.lat && filters.lng ? { lat: filters.lat, lng: filters.lng } : undefined)}
              onMarkerClick={handleMarkerSelect}
              selectedId={selectedId}
            />
            <div className="mt-3 text-xs text-[#9CA3AF]">
              {results.length} creators on map — click a pin to highlight its card. 
              <button className="ml-2 underline" onClick={() => toggleView("grid")}>Back to list</button>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-[#1F2937] py-8 text-center text-xs text-[#9CA3AF]">
        seekr — indexes public creator profiles only. No content hosted here. No accounts. No ads.
      </footer>

      {/* Advanced Filters Sheet */}
      <FilterSheet 
        open={showFilterSheet} 
        onClose={() => setShowFilterSheet(false)} 
        filters={filters} 
        onChange={setFiltersAndSync} 
      />

      {/* Mobile search overlay */}
      {MobileSearchOverlay}
    </div>
  );
}
