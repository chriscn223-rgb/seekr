import { Creator, RankedCreator, SearchFilters } from "./types";

// Haversine distance in km
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Core production ranking formula
// score = (text_relevance * 0.45) + (pop * 0.22) + (eng * 0.20) + (loc * 0.08) + (tagMatch * 0.05)
export function computeCreatorScore(
  baseRelevance: number, // 0-1 from search engine (normalized)
  creator: Creator,
  filters?: SearchFilters
): { score: number; distanceKm?: number } {
  const pop = (creator.popularity_score ?? 0) / 100;
  const eng = (creator.engagement_score ?? 0) / 100;

  let locScore = 0;
  let distanceKm: number | undefined;

  if (filters?.lat != null && filters?.lng != null && creator.lat != null && creator.lng != null) {
    distanceKm = haversineKm(filters.lat, filters.lng, creator.lat, creator.lng);
    const radius = filters.radiusKm ?? 150;
    // Proximity score: 1.0 at same location, falls off to 0 at ~radius*1.6
    const decay = Math.max(0, 1 - distanceKm / (radius * 1.65));
    locScore = decay * 0.9 + 0.1; // small floor
  }

  // Tag / category boost (if user filtered explicitly)
  let tagBoost = 0;
  if (filters?.category && creator.category.toLowerCase() === filters.category.toLowerCase()) {
    tagBoost += 0.07;
  }
  if (filters?.tags && filters.tags.length > 0) {
    const matches = filters.tags.filter((t) =>
      creator.tags.some((ct) => ct.toLowerCase() === t.toLowerCase())
    ).length;
    tagBoost += Math.min(0.09, matches * 0.035);
  }

  // Combine - keep final between ~0.05 and ~0.995
  const textWeight = Math.max(0, Math.min(1, baseRelevance));
  const raw =
    textWeight * 0.45 +
    pop * 0.22 +
    eng * 0.20 +
    locScore * 0.08 +
    tagBoost * 0.05;

  const score = Math.max(0.04, Math.min(0.995, raw));

  return { score, distanceKm };
}

// Apply full ranking to a list of candidates (after initial search or filter pass)
export function rankCreators(
  creators: Creator[],
  textRelevances: Map<string, number>, // username -> 0..1 relevance from engine
  filters: SearchFilters
): RankedCreator[] {
  const ranked = creators.map((c) => {
    const rel = textRelevances.get(c.username) ?? 0.5;
    const { score, distanceKm } = computeCreatorScore(rel, c, filters);
    return { ...c, _score: score, _distanceKm: distanceKm } as RankedCreator;
  });

  // Sort according to requested sort mode
  const sort = filters.sort ?? "relevance";

  if (sort === "popularity") {
    ranked.sort((a, b) => b.popularity_score - a.popularity_score || b._score - a._score);
  } else if (sort === "engagement") {
    ranked.sort((a, b) => b.engagement_score - a.engagement_score || b._score - a._score);
  } else if (sort === "newest") {
    ranked.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
  } else {
    // relevance (primary our computed score)
    ranked.sort((a, b) => b._score - a._score);
  }

  return ranked;
}
