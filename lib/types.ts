export interface PlatformLink {
  name: string; // "OnlyFans" | "Fansly" | "Patreon" | "YouTube" | ...
  url: string;
  price?: number; // monthly subscription price in USD, optional
}

export interface Creator {
  id: string;
  username: string; // unique, used for URL
  display_name: string;
  bio: string;
  avatar_url: string; // picsum or external (alias for profile_image_url for new schema)
  profile_image_url: string;
  category: string;
  tags: string[];
  location_city?: string;
  location_state?: string;
  location_country?: string;
  country?: string;
  city?: string;
  lat?: number;
  lng?: number;
  popularity_score: number; // 0-100
  engagement_score: number; // 0-100
  signal_score: number; // 0-100 composite quality
  primary_platform?: string;
  price_monthly?: number;
  is_free: boolean;
  is_nsfw: boolean;
  last_active_at: string; // ISO
  platforms: PlatformLink[];
  updated_at: string; // ISO
}

// Search result with our custom computed score
export interface RankedCreator extends Creator {
  _score: number;
  _distanceKm?: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  platforms?: string[];
  minPopularity?: number;
  minEngagement?: number;
  maxPrice?: number;
  minSignal?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: "relevance" | "popularity" | "engagement" | "newest" | "price" | "distance";
  hideNsfw?: boolean;
}

export interface SearchResponse {
  results: RankedCreator[];
  total: number;
  tookMs: number;
  facets: {
    categories: Array<{ value: string; count: number }>;
    tags: Array<{ value: string; count: number }>;
    platforms: Array<{ value: string; count: number }>;
  };
}

export interface CategoryCount {
  name: string;
  count: number;
}
