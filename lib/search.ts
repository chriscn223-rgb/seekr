import { create, insert, search, Orama, Results } from "@orama/orama";
import { ALL_CREATORS } from "./seed";
import { Creator, RankedCreator, SearchFilters, SearchResponse } from "./types";
import { rankCreators } from "./ranking";
import { PLATFORMS } from "./constants";

let oramaInstance: Orama<any> | null = null;

export type CreatorIndexDoc = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  category: string;
  tags: string[];
  location_city: string;
  location_state: string;
  location_country: string;
  lat: number | null;
  lng: number | null;
  popularity_score: number;
  engagement_score: number;
  platforms: string; // joined for text search
};

// Build the Orama search engine (embedded, super fast, fuzzy + typo tolerant)
export async function getSearchEngine(): Promise<Orama<any>> {
  if (oramaInstance) return oramaInstance;

  const db = await create({
    schema: {
      id: "string",
      username: "string",
      display_name: "string",
      bio: "string",
      category: "string",
      tags: "string[]",
      location_city: "string",
      location_state: "string",
      location_country: "string",
      lat: "number",
      lng: "number",
      popularity_score: "number",
      engagement_score: "number",
      platforms: "string",
    },
    // Orama has excellent defaults for fuzzy + prefix + tolerance
  });

  // Insert every creator into the index (fast)
  for (const c of ALL_CREATORS) {
    const doc: CreatorIndexDoc = {
      id: c.id,
      username: c.username,
      display_name: c.display_name,
      bio: c.bio,
      category: c.category,
      tags: c.tags,
      location_city: c.location_city || "",
      location_state: c.location_state || "",
      location_country: c.location_country || "",
      lat: c.lat ?? 0,
      lng: c.lng ?? 0,
      popularity_score: c.popularity_score,
      engagement_score: c.engagement_score,
      platforms: c.platforms.map((p) => p.name).join(" "),
    };
    await insert(db, doc as any);
  }

  oramaInstance = db;
  return db;
}

// Perform search + apply our advanced ranking formula + geo + facets
export async function searchCreators(filters: SearchFilters): Promise<SearchResponse> {
  const start = Date.now();
  const engine = await getSearchEngine();

  const limit = 400; // generous; we slice client side for perf

  // Build Orama query
  const oramaQuery: any = {
    term: filters.query || "",
    limit,
    // Excellent defaults give fuzzy + typo tolerance + prefix matching out of the box
    tolerance: 1,
    boost: {
      username: 2.8,
      display_name: 2.2,
      tags: 1.6,
      category: 1.4,
      bio: 0.8,
      platforms: 0.6,
    },
    properties: ["username", "display_name", "bio", "category", "tags", "platforms", "location_city", "location_country"],
  };

  // Category filter (exact)
  if (filters.category) {
    oramaQuery.where = { ...(oramaQuery.where || {}), category: filters.category };
  }

  let results: Results<any>;
  try {
    results = await search(engine, oramaQuery);
  } catch (e) {
    // Fallback to empty if something weird happens
    results = { hits: [], count: 0 } as any;
  }

  // Map hits back to full creator objects
  let candidates: Creator[] = results.hits
    .map((hit: any) => {
      const found = ALL_CREATORS.find((c) => c.id === hit.document.id);
      return found;
    })
    .filter(Boolean) as Creator[];

  // Apply additional hard filters not perfectly handled in orama query
  if (filters.tags && filters.tags.length > 0) {
    candidates = candidates.filter((c) =>
      filters.tags!.some((t) => c.tags.some((ct) => ct.toLowerCase() === t.toLowerCase()))
    );
  }

  if (filters.platforms && filters.platforms.length > 0) {
    candidates = candidates.filter((c) =>
      filters.platforms!.some((p) =>
        c.platforms.some((pl) => pl.name.toLowerCase() === p.toLowerCase())
      )
    );
  }

  if (filters.minPopularity != null) {
    candidates = candidates.filter((c) => c.popularity_score >= (filters.minPopularity ?? 0));
  }
  if (filters.minEngagement != null) {
    candidates = candidates.filter((c) => c.engagement_score >= (filters.minEngagement ?? 0));
  }
  if (filters.maxPrice != null) {
    candidates = candidates.filter((c) =>
      c.platforms.some((p) => p.price != null && p.price <= (filters.maxPrice ?? 999))
    );
  }

  // Geo radius hard filter (orama could do but post is reliable)
  if (filters.lat != null && filters.lng != null && filters.radiusKm != null) {
    const { haversineKm } = await import("./ranking");
    candidates = candidates.filter((c) => {
      if (c.lat == null || c.lng == null) return false;
      const d = haversineKm(filters.lat!, filters.lng!, c.lat, c.lng);
      return d <= (filters.radiusKm ?? 99999);
    });
  }

  // Build relevance map from orama (normalized 0-1 using score)
  const maxOramaScore = Math.max(0.0001, ...results.hits.map((h: any) => h.score || 0));
  const textRelevances = new Map<string, number>();
  results.hits.forEach((hit: any) => {
    const rel = Math.min(1, (hit.score || 0) / maxOramaScore);
    const c = ALL_CREATORS.find((x) => x.id === hit.document.id);
    if (c) textRelevances.set(c.username, rel);
  });

  // Apply our custom production ranking (text + popularity + engagement + location + tag match)
  let ranked = rankCreators(candidates, textRelevances, filters);

  // If no query and no filters, boost trending naturally via popularity sort as default
  if (!filters.query && !filters.category && !filters.tags?.length && !filters.lat) {
    if (filters.sort === "relevance" || !filters.sort) {
      ranked.sort((a, b) => b.popularity_score - a.popularity_score || b._score - a._score);
    }
  }

  const total = ranked.length;
  const tookMs = Date.now() - start;

  // Facets (on the filtered set for accuracy)
  const catMap = new Map<string, number>();
  const tagMap = new Map<string, number>();
  const platMap = new Map<string, number>();

  ranked.forEach((c) => {
    catMap.set(c.category, (catMap.get(c.category) || 0) + 1);
    c.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
    c.platforms.forEach((p) => platMap.set(p.name, (platMap.get(p.name) || 0) + 1));
  });

  const facets = {
    categories: Array.from(catMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    tags: Array.from(tagMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 28),
    platforms: PLATFORMS.map((p) => ({
      value: p,
      count: platMap.get(p) || 0,
    })).filter((p) => p.count > 0),
  };

  // Cap results for response size (client paginates)
  const resultsLimited = ranked.slice(0, 220);

  return {
    results: resultsLimited,
    total,
    tookMs,
    facets,
  };
}

// Autocomplete / suggestions (very fast)
export async function getAutocompleteSuggestions(query: string, limit = 8) {
  if (!query || query.length < 1) return [];

  const engine = await getSearchEngine();
  const res = await search(engine, {
    term: query,
    limit,
    tolerance: 0,
    boost: { username: 3.2, display_name: 2.4, tags: 1.7 },
    properties: ["username", "display_name", "tags", "category"],
  });

  return res.hits.map((h: any) => {
    const c = ALL_CREATORS.find((x) => x.id === h.document.id);
    return c ? { username: c.username, display_name: c.display_name, category: c.category } : null;
  }).filter(Boolean);
}

// Get all categories with counts (for homepage)
export function getCategoryCounts() {
  const map = new Map<string, number>();
  for (const c of ALL_CREATORS) {
    map.set(c.category, (map.get(c.category) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Trending: top by popularity + engagement
export function getTrending(limit = 12): Creator[] {
  return [...ALL_CREATORS]
    .sort((a, b) => {
      const sa = a.popularity_score * 0.65 + a.engagement_score * 0.35;
      const sb = b.popularity_score * 0.65 + b.engagement_score * 0.35;
      return sb - sa;
    })
    .slice(0, limit);
}

// Nearby creators using pure distance (used by /nearby + map)
export function getNearby(lat: number, lng: number, radiusKm = 80, limit = 60): RankedCreator[] {
  const { haversineKm } = require("./ranking");
  const withDist = ALL_CREATORS
    .filter((c): c is Creator & { lat: number; lng: number } => c.lat != null && c.lng != null)
    .map((c) => ({
      ...c,
      _distanceKm: haversineKm(lat, lng, c.lat, c.lng),
    }))
    .filter((c) => c._distanceKm <= radiusKm)
    .sort((a, b) => a._distanceKm! - b._distanceKm!)
    .slice(0, limit);

  return withDist.map((c) => ({
    ...c,
    _score: Math.max(0.3, 1 - (c._distanceKm! / (radiusKm * 1.3))),
  })) as RankedCreator[];
}
