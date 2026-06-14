export const CATEGORIES = [
  "Fitness",
  "Gaming",
  "Music",
  "Art & Design",
  "Lifestyle",
  "Fashion",
  "Tech",
  "Cooking",
  "Travel",
  "Cosplay",
  "Comedy",
  "Education",
  "ASMR",
  "Dance",
  "Photography",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PLATFORMS = [
  "OnlyFans",
  "Fansly",
  "Patreon",
  "YouTube",
  "Instagram",
  "TikTok",
  "Twitch",
  "X",
  "Reddit",
] as const;

export type PlatformName = (typeof PLATFORMS)[number];

// Popular tags that appear across creators (used for filters + generation)
export const COMMON_TAGS = [
  "fitness", "gym", "yoga", "cosplay", "anime", "gaming", "twitch", "streamer",
  "singer", "musician", "guitar", "piano", "artist", "painter", "illustrator",
  "model", "fashion", "style", "makeup", "travel", "adventure", "foodie", "chef",
  "tech", "coding", "ai", "reviews", "comedy", "skits", "dance", "choreography",
  "photography", "nature", "vlogs", "asmr", "education", "tutorials", "wellness",
  "outdoors", "hiking", "pets", "cats", "dogs", "books", "reading", "film", "cinema",
];

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "popularity", label: "Popularity" },
  { value: "engagement", label: "Engagement" },
  { value: "newest", label: "Recently Updated" },
] as const;

// Approximate country centers for demo geo seeding (real coords would be better in prod)
export const COUNTRY_COORDS: Record<string, { lat: number; lng: number; cities: string[] }> = {
  "United States": { lat: 39.5, lng: -98.35, cities: ["Los Angeles", "New York", "Chicago", "Austin", "Miami", "Seattle", "Denver"] },
  "United Kingdom": { lat: 54.5, lng: -2, cities: ["London", "Manchester", "Edinburgh", "Bristol"] },
  "Canada": { lat: 56.1, lng: -106.3, cities: ["Toronto", "Vancouver", "Montreal", "Calgary"] },
  "Germany": { lat: 51.16, lng: 10.45, cities: ["Berlin", "Munich", "Hamburg", "Cologne"] },
  "France": { lat: 46.6, lng: 2.2, cities: ["Paris", "Lyon", "Marseille", "Bordeaux"] },
  "Japan": { lat: 36.2, lng: 138.25, cities: ["Tokyo", "Osaka", "Kyoto", "Sapporo"] },
  "Australia": { lat: -25.27, lng: 133.77, cities: ["Sydney", "Melbourne", "Brisbane", "Perth"] },
  "Brazil": { lat: -14.23, lng: -51.92, cities: ["São Paulo", "Rio de Janeiro", "Brasília"] },
  "Spain": { lat: 40.46, lng: -3.75, cities: ["Madrid", "Barcelona", "Valencia"] },
};
