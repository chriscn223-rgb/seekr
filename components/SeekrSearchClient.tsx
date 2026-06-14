use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import FilterSheet from "@/components/FilterSheet";
import CreatorCard from "@/components/CreatorCard";
import ViewToggle from "@/components/ViewToggle";
import MapView from "@/components/MapView";
import { searchCreators, getCategoryCounts } from "@/lib/search";
import { SearchFilters, RankedCreator, SearchResponse } from "@/lib/types";
import { X, Search, MapPin, Link as LinkIcon } from "lucide-react";
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

  // Animated live stats for hero panel (count-up effect)
  const [animatedCreators, setAnimatedCreators] = useState(0);
  const [animatedCountries, setAnimatedCountries] = useState(0);
  const [statsMounted, setStatsMounted] = useState(false);

  // Demo "live" niche data that can be "refreshed"
  const [nicheData, setNicheData] = useState([
    { name: "Gaming", count: 4211, pct: 82 },
    { name: "Beauty", count: 2948, pct: 58 },
    { name: "Tech", count: 2103, pct: 41 },
    { name: "Cosplay", count: 1872, pct: 36 },
  ]);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoLive, setAutoLive] = useState(true);

  // Additional live jittering metrics for the stats panel
  const [liveSearchesPerMin, setLiveSearchesPerMin] = useState(138);
  const [liveUpdatedToday, setLiveUpdatedToday] = useState(312);

  // Live ticking clock for the "Updated" timestamp + auto live updates for demo "live dashboard" feel
  useEffect(() => {
    if (!lastUpdated) return;

    const tickClock = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);

    let autoInterval: any = null;
    if (autoLive) {
      autoInterval = setInterval(() => {
        // Auto "live" jitter for niches (small random changes)
        setNicheData(prev => prev.map(item => {
          const jitter = (Math.random() - 0.5) * 6; // smaller jitter for auto
          const newPct = Math.max(18, Math.min(95, Math.round(item.pct + jitter)));
          const newCount = Math.max(800, Math.round(item.count * (newPct / item.pct)));
          return { ...item, pct: newPct, count: newCount };
        }));
        setLastUpdated(new Date());
        // Occasionally bump main creators count
        if (Math.random() > 0.6) {
          setAnimatedCreators(c => c + Math.floor(Math.random() * 3) + 1);
        }
        // Jitter additional live activity metrics
        if (Math.random() > 0.45) {
          setLiveSearchesPerMin(s => Math.max(72, Math.min(198, Math.round(s + (Math.random() - 0.5) * 9))));
        }
        if (Math.random() > 0.7) {
          setLiveUpdatedToday(s => Math.max(280, Math.min(420, s + Math.floor(Math.random() * 3) + 1)));
        }
        // Re-trigger bars
        setStatsMounted(false);
        setTimeout(() => setStatsMounted(true), 20);
      }, 15000); // every 15s for "live" simulation
    }

    return () => {
      clearInterval(tickClock);
      if (autoInterval) clearInterval(autoInterval);
    };
  }, [lastUpdated, autoLive]);

  // Demo submitted creators (simulates submissions appearing in results)
  const [demoAdded, setDemoAdded] = useState<any[]>([]);

  const refreshNiches = () => {
    setNicheData(prev => prev.map(item => {
      const jitter = (Math.random() - 0.5) * 12;
      const newPct = Math.max(18, Math.min(95, Math.round(item.pct + jitter)));
      const newCount = Math.max(800, Math.round(item.count * (newPct / item.pct)));
      return { ...item, pct: newPct, count: newCount };
    }));
    setLastUpdated(new Date());
    // Re-trigger bar animation
    setStatsMounted(false);
    setTimeout(() => setStatsMounted(true), 30);
    // Bump main stats + live activity metrics for demo liveness
    setAnimatedCreators(c => c + Math.floor(Math.random() * 4) + 1);
    setLiveSearchesPerMin(s => Math.max(72, Math.min(198, Math.round(s + (Math.random() - 0.5) * 14))));
    setLiveUpdatedToday(s => Math.max(280, Math.min(420, s + Math.floor(Math.random() * 4) + 2)));
  };

  const addDemoCreator = () => {
    const newDemo = {
      id: `demo-${Date.now()}`,
      username: `demo${Math.floor(Math.random() * 1000)}`,
      display_name: `Demo Creator ${Math.floor(Math.random() * 100)}`,
      bio: 'Freshly submitted profile for demo purposes. High signal creator in lifestyle space.',
      avatar_url: `https://picsum.photos/id/${10 + Math.floor(Math.random() * 50)}/320/320`,
      category: 'Lifestyle',
      tags: ['lifestyle', 'demo', 'new'],
      location_city: 'Demo City',
      location_country: 'USA',
      lat: 40.7,
      lng: -74,
      popularity_score: 85,
      engagement_score: 90,
      signal_score: 92,
      primary_platform: 'Instagram',
      price_monthly: 15,
      is_free: false,
      is_nsfw: false,
      last_active_at: new Date().toISOString(),
      platforms: [{ name: 'Instagram', url: '#', price: 15 }, { name: 'OnlyFans', url: '#' }],
      updated_at: new Date().toISOString(),
      _score: 0.99,
    };
    const updated = [newDemo, ...demoAdded].slice(0, 5);
    setDemoAdded(updated);
    try {
      localStorage.setItem('seekr_demo_creators', JSON.stringify(updated));
    } catch {}
    toast.success('Demo creator added to results! (simulates a fresh submission)');
  };

  // UI sheets
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Data for chips
  const [categories] = useState(() => getCategoryCounts().slice(0, 8));

  // Load persisted demo submissions from submit page on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seekr_demo_creators');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDemoAdded(parsed);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // URL sync (lightweight) — all meaningful filters for shareable searches
  const updateURL = (f: SearchFilters, v?: "grid" | "map") => {
    const p = new URLSearchParams();
    if (f.query) p.set("q", f.query);
    if (f.category) p.set("category", f.category);
    (f.tags || []).forEach(t => p.append("tag", t));
    (f.platforms || []).forEach(pl => p.append("platform", pl));
    if (f.minPopularity) p.set("pop", String(f.minPopularity));
    if (f.minEngagement) p.set("eng", String(f.minEngagement));
    if (f.maxPrice) p.set("price", String(f.maxPrice));
    if (f.minSignal) p.set("signal", String(f.minSignal));
    if (f.sort && f.sort !== "relevance") p.set("sort", f.sort);
    if (f.lat) p.set("lat", String(f.lat));
    if (f.lng) p.set("lng", String(f.lng));
    if (f.radiusKm) p.set("radius", String(f.radiusKm));
    if (f.hideNsfw) p.set("hideNsfw", "true");
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

  // Count-up animation for hero live stats (triggers once on mount)
  useEffect(() => {
    const animateCount = (setter: (v: number) => void, target: number, duration = 900) => {
      const startTime = Date.now();
      const tick = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const current = Math.floor(target * (1 - Math.pow(1 - progress, 3))); // ease-out cubic
        setter(current);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setter(target);
        }
      };
      requestAnimationFrame(tick);
    };

    animateCount(setAnimatedCreators, 23418);
    animateCount(setAnimatedCountries, 71);
    const now = new Date();
    setLastUpdated(now);
    setTimeout(() => setStatsMounted(true), 50); // trigger bar fills after count starts
  }, []);

  // Client-side post filtering for hideNsfw (data model supports is_nsfw)
  // Merge demo added creators (simulates submissions)
  const displayResults = useMemo(() => {
    let r = [...demoAdded, ...results];
    if (filters.hideNsfw) {
      r = r.filter((c: any) => !c.is_nsfw);
    }
    return r;
  }, [results, filters.hideNsfw, demoAdded]);

  const filteredTotal = useMemo(() => {
    let base = results;
    if (filters.hideNsfw) {
      base = base.filter((c: any) => !c.is_nsfw);
    }
    return demoAdded.length + base.length;
  }, [results, filters.hideNsfw, demoAdded]);

  // Visible results
  const visible = useMemo(() => displayResults.slice(0, page * PAGE_SIZE), [displayResults, page]);
  const hasMore = visible.length < displayResults.length;

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

  const shareSearch = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Search link copied — anyone can open this exact view");
    }).catch(() => {
      toast.info(url); // fallback
    });
  };

  // Remove a single active filter key (for the active filters row)
  const clearOneFilter = (key: keyof SearchFilters) => {
    const nf = { ...filters };
    // @ts-ignore - flexible demo clearing
    delete nf[key];
    if (key === 'lat' || key === 'lng' || key === 'radiusKm') {
      delete nf.lat; delete nf.lng; delete nf.radiusKm;
      setUserLocation(null);
    }
    if (key === 'platforms') nf.platforms = undefined;
    if (key === 'tags') nf.tags = undefined;
    setFiltersAndSync(nf);
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

      {/* NEW PREMIUM HERO — asymmetric "Deep Intelligence" layout */}
      <div className="container pt-10 pb-8">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          {/* LEFT: Value + Search */}
          <div className="md:col-span-7">
            <div className="label tracking-[1.5px] text-[#F0A500] mb-2">THE CREATOR INTELLIGENCE LAYER</div>
            
            <h1 className="h1 mb-3">
              Find the exact creator<br />you need. Instantly.
            </h1>
            <p className="text-[#7B849C] text-lg max-w-[38ch]">
              Search 23,000+ creators across platforms, niches, and locations.<br />No ads. No logins. Just profiles.
            </p>

            {/* Dominant search bar (integrated) */}
            <div className="mt-6 max-w-[620px]">
              <SearchBar
                value={filters.query || ""}
                onChange={handleQuery}
                onSubmit={() => runSearch(filters)}
                onNearMe={handleNearMe}
                onAdvanced={handleAdvanced}
              />
              <div className="flex items-center justify-between text-[11px] text-[#7B849C] mt-2 px-1">
                <div>
                  Showing <span className="font-mono text-[#EDF0F8]">{filteredTotal}</span> creators • {tookMs}ms
                </div>
              </div>
            </div>

            {/* Inline trend chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {["cosplay LA", "beauty influencer", "dev vlog", "fitness creator"].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => { setFiltersAndSync({ ...filters, query: q }); runSearch({ ...filters, query: q }); }}
                  className="chip text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Live Stats Panel (desktop only) */}
          <div className="md:col-span-5 hidden md:block">
            <div className="stats-panel">
              <div className="flex items-center gap-2 uppercase tracking-[1px] text-[10px] text-[#F0A500] mb-1">
                <span className="w-1.5 h-1.5 bg-[#F0A500] rounded-full animate-pulse" /> LIVE INDEX
                <label className="ml-auto flex items-center gap-1 text-[9px] text-[#7B849C] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoLive}
                    onChange={e => setAutoLive(e.target.checked)}
                    className="accent-[#F0A500] scale-75"
                  />
                  Auto live (demo)
                </label>
              </div>
              <div className="text-[9px] text-[#7B849C] -mt-1 mb-2" suppressHydrationWarning>
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Updated —'}
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Creators indexed</span> <span className="font-mono text-[#EDF0F8] count-up">{animatedCreators.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Countries covered</span> <span className="font-mono text-[#EDF0F8] count-up">{animatedCountries}</span></div>
                <div className="flex justify-between"><span>Searches / min</span> <span className="font-mono text-[#EDF0F8]">{liveSearchesPerMin}</span></div>
                <div className="flex justify-between"><span>Profiles updated today</span> <span className="font-mono text-[#EDF0F8]">{liveUpdatedToday}</span></div>
                <div className="flex justify-between"><span>Avg search response</span> <span className="font-mono text-[#EDF0F8]">&lt; 200ms</span></div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#1A2038]">
                <div className="flex items-center justify-between">
                  <div className="uppercase tracking-[1px] text-[10px] text-[#7B849C] mb-3">TOP NICHES RIGHT NOW</div>
                  <button 
                    onClick={refreshNiches}
                    className="text-[10px] text-[#F0A500] hover:underline mb-3"
                  >
                    Refresh demo
                  </button>
                </div>
                
                {nicheData.map((n, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 mb-2 text-xs cursor-pointer hover:text-[#F0A500] transition-colors"
                    onClick={() => setFiltersAndSync({ ...filters, category: n.name })}
                    title={`Filter results to ${n.name}`}
                  >
                    <div className="w-16 text-[#7B849C]">{n.name}</div>
                    <div className="flex-1 stats-bar"><div className="stats-bar-fill" style={{ width: statsMounted ? `${n.pct}%` : '0%' }} /></div>
                    <div className="font-mono w-12 text-right text-[#EDF0F8]">{n.count.toLocaleString()}</div>
                  </div>
                ))}
              </div>
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
            <button 
              onClick={() => setFiltersAndSync({ ...filters, hideNsfw: !filters.hideNsfw })}
              className={`chip text-xs h-7 ${filters.hideNsfw ? 'active' : ''}`}
            >
              {filters.hideNsfw ? 'Show 18+' : 'Hide 18+'}
            </button>
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
          <span className="ml-3 text-sm text-[#9CA3AF] font-mono">{filteredTotal} indexed • {tookMs}ms</span>
        </div>

        {view === "grid" && (
          <button 
            onClick={() => setShowMobileSearch(true)} 
            className="sm:hidden flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F2937] text-sm"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        )}

        <div className="flex items-center gap-2">
          <button 
            onClick={shareSearch} 
            className="chip text-xs hidden sm:inline-flex items-center gap-1"
            title="Copy shareable link for this exact search + filters"
          >
            <LinkIcon className="w-3.5 h-3.5" /> Copy link
          </button>
          <button 
            onClick={addDemoCreator} 
            className="chip text-xs hidden sm:inline-flex"
          >
            + Add demo creator
          </button>
          {demoAdded.length > 0 && (
            <button 
              onClick={() => {
                setDemoAdded([]);
                try { localStorage.removeItem('seekr_demo_creators'); } catch {}
                toast.info('Demo creators cleared');
              }} 
              className="chip text-xs hidden sm:inline-flex text-[#F97373] border-[#F97373]/30"
            >
              Clear demos
            </button>
          )}
        </div>
      </div>

      {/* Active filters summary row (micro-interaction, clearable) */}
      {(filters.category || filters.query || (filters.platforms && filters.platforms.length) || filters.lat || filters.hideNsfw || filters.sort !== 'relevance') && (
        <div className="container pt-2 pb-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#7B849C] mr-1">Active:</span>
            {filters.query && (
              <button onClick={() => setFiltersAndSync({ ...filters, query: undefined })} className="chip !py-0.5 !px-2.5 text-[11px] flex items-center gap-1 active">q: {filters.query} <span className="opacity-60">×</span></button>
            )}
            {filters.category && (
              <button onClick={() => clearOneFilter('category')} className="chip !py-0.5 !px-2.5 text-[11px] flex items-center gap-1 active">cat: {filters.category} <span className="opacity-60">×</span></button>
            )}
            {filters.platforms?.map((p, idx) => (
              <button key={idx} onClick={() => {
                const next = (filters.platforms || []).filter(x => x !== p);
                setFiltersAndSync({ ...filters, platforms: next.length ? next : undefined });
              }} className="chip !py-0.5 !px-2.5 text-[11px] flex items-center gap-1 active">plat: {p} <span className="opacity-60">×</span></button>
            ))}
            {filters.lat && (
              <button onClick={clearLocation} className="chip !py-0.5 !px-2.5 text-[11px] flex items-center gap-1 active">nearby <span className="opacity-60">×</span></button>
            )}
            {filters.hideNsfw && (
              <button onClick={() => setFiltersAndSync({ ...filters, hideNsfw: false })} className="chip !py-0.5 !px-2.5 text-[11px] flex items-center gap-1 active">hide 18+ <span className="opacity-60">×</span></button>
            )}
            <button onClick={() => {
              setUserLocation(null);
              setFiltersAndSync({ sort: 'relevance', hideNsfw: false });
            }} className="text-[11px] text-[#F0A500] underline ml-1">Clear all</button>
          </div>
        </div>
      )}

      {/* RESULTS / MAP AREA */}
      <div className="container pb-16 flex-1 pt-4">
        {view === "grid" ? (
          <>
            {/* Magazine lead card when searching (per spec) */}
            {filters.query && visible.length > 0 && (
              <div className="mb-6 card overflow-hidden">
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-2 aspect-video md:aspect-auto bg-[#111827]">
                    <img src={visible[0].avatar_url || visible[0].profile_image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="p-5 md:col-span-3 flex flex-col">
                    <div>
                      <div className="font-semibold text-lg">{visible[0].display_name} <span className="text-[#7B849C] font-normal">@{visible[0].username}</span></div>
                      <div className="text-sm text-[#7B849C]">{visible[0].location_city || visible[0].city}, {visible[0].location_country || visible[0].country}</div>
                    </div>
                    <p className="mt-2 text-sm text-[#7B849C] line-clamp-2">{visible[0].bio}</p>
                    <div className="mt-auto pt-4 flex gap-2">
                      <Link href={`/creator/${visible[0].username}`} className="btn btn-primary">View profile</Link>
                      <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/creator/${visible[0].username}`).then(()=>toast.success("Link copied"))} className="btn btn-ghost">Share</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && visible.length === 0 ? (
              <div className="results-grid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card h-[310px] skeleton" />
                ))}
              </div>
            ) : visible.length > 0 ? (
              <div className="results-grid">
                {visible.slice(filters.query ? 1 : 0).map((creator) => (
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
              <div className="empty-state text-center py-12">
                <div className="mx-auto mb-4 w-16 h-16 relative">
                  <svg viewBox="0 0 64 64" className="w-full h-full text-[#F0A500] opacity-70">
                    <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M32 10 L32 54" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 32 L54 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    {/* Animated sweep */}
                    <path d="M32 32 L52 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="origin-center animate-[spin_3s_linear_infinite]"/>
                  </svg>
                </div>
                <div className="text-[#7B849C] text-lg">No creators matched your search.</div>
                <div className="text-xs mt-2 text-[#7B849C]">Try broadening your filters or these examples:</div>
                <div className="flex justify-center gap-2 mt-2 text-xs">
                  <button onClick={() => setFiltersAndSync({query: "cosplay"})} className="chip">cosplay</button>
                  <button onClick={() => setFiltersAndSync({query: "fitness LA"})} className="chip">fitness LA</button>
                  <button onClick={() => setFiltersAndSync({query: "tech reviews"})} className="chip">tech reviews</button>
                </div>
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

      {/* Mobile FAB — quick actions (per redesign blueprint) */}
      <div className="fixed bottom-4 right-4 sm:hidden z-[70] flex flex-col items-end gap-2.5">
        <button
          onClick={addDemoCreator}
          className="w-12 h-12 rounded-full bg-[#F0A500] text-[#080B14] flex items-center justify-center shadow-2xl active:scale-[0.96] transition font-semibold text-xl leading-none"
          aria-label="Add demo creator"
        >
          +
        </button>
        <button
          onClick={handleNearMe}
          className="w-11 h-11 rounded-full bg-[#0F1525] border border-[#F0A500]/50 text-[#F0A500] flex items-center justify-center shadow-xl active:scale-[0.96] transition"
          aria-label="Find creators near me"
        >
          <MapPin className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={() => setShowFilterSheet(true)}
          className="w-11 h-11 rounded-full bg-[#0F1525] border border-[#6B9BF2]/50 text-[#6B9BF2] flex items-center justify-center shadow-xl active:scale-[0.96] transition text-[11px] tracking-[0.5px]"
          aria-label="Open advanced filters"
        >
          F
        </button>
      </div>
    </div>
  );
}
