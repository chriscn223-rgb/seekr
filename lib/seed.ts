import { faker } from "@faker-js/faker";
import { Creator, PlatformLink } from "./types";
import { CATEGORIES, PLATFORMS, COMMON_TAGS, COUNTRY_COORDS } from "./constants";

// Seed for reproducibility across runs
faker.seed(424242);

const PLATFORM_URLS: Record<string, (username: string) => string> = {
  OnlyFans: (u) => `https://onlyfans.com/${u}`,
  Fansly: (u) => `https://fansly.com/${u}`,
  Patreon: (u) => `https://patreon.com/${u}`,
  YouTube: (u) => `https://youtube.com/@${u}`,
  Instagram: (u) => `https://instagram.com/${u}`,
  TikTok: (u) => `https://tiktok.com/@${u}`,
  Twitch: (u) => `https://twitch.tv/${u}`,
  X: (u) => `https://x.com/${u}`,
  Reddit: (u) => `https://reddit.com/user/${u}`,
};

function randomPlatforms(username: string): PlatformLink[] {
  const count = faker.number.int({ min: 1, max: 4 });
  const shuffled = faker.helpers.shuffle([...PLATFORMS]);
  const chosen = shuffled.slice(0, count);

  return chosen.map((name) => {
    const url = PLATFORM_URLS[name](username);
    // Only subscription platforms get realistic prices
    const price =
      name === "OnlyFans" || name === "Fansly" || name === "Patreon"
        ? faker.number.int({ min: 4, max: 49 })
        : undefined;
    return { name, url, price };
  });
}

function pickLocation() {
  const countries = Object.keys(COUNTRY_COORDS);
  const country = faker.helpers.arrayElement(countries);
  const coordInfo = COUNTRY_COORDS[country];
  const city = faker.helpers.arrayElement(coordInfo.cities);

  // Add small jitter for realism
  const lat = coordInfo.lat + (faker.number.float({ min: -2.8, max: 2.8 }));
  const lng = coordInfo.lng + (faker.number.float({ min: -3.2, max: 3.2 }));

  const state =
    country === "United States"
      ? faker.location.state({ abbreviated: true })
      : country === "Canada"
        ? faker.location.state({ abbreviated: true })
        : undefined;

  return {
    location_city: city,
    location_state: state,
    location_country: country,
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
  };
}

function generateTags(category: string): string[] {
  const base = COMMON_TAGS.filter((t) =>
    category.toLowerCase().includes(t) ||
    (category === "Fitness" && ["fitness", "gym", "yoga", "wellness"].includes(t)) ||
    (category === "Gaming" && ["gaming", "twitch", "streamer"].includes(t)) ||
    (category === "Music" && ["singer", "musician", "guitar"].includes(t))
  );

  const pool = base.length > 2 ? base : COMMON_TAGS;
  const num = faker.number.int({ min: 2, max: 6 });
  const picked = faker.helpers.arrayElements(pool, num);

  // Always add category related
  const catTag = category.toLowerCase().split(" ")[0];
  if (!picked.includes(catTag)) picked.push(catTag);

  return Array.from(new Set(picked)).slice(0, 6);
}

function generateBio(name: string, category: string, tags: string[]): string {
  const intros = [
    `Passionate ${category.toLowerCase()} creator sharing my journey.`,
    `Daily life, behind the scenes, and creative experiments.`,
    `Here for the community. Let's connect and grow together.`,
    `Exploring ${category.toLowerCase()} one post at a time.`,
  ];
  const extra = tags.length > 0 ? ` Obsessed with ${tags.slice(0, 2).join(" and ")}.` : "";
  return faker.helpers.arrayElement(intros) + extra + " " + faker.lorem.sentence();
}

export function generateCreators(count = 148): Creator[] {
  const creators: Creator[] = [];
  const usedUsernames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let username = faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18);
    while (usedUsernames.has(username)) {
      username = faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18) + faker.number.int({ max: 99 });
    }
    usedUsernames.add(username);

    const display_name = faker.person.fullName();
    const category = faker.helpers.arrayElement(CATEGORIES);

    const loc = faker.datatype.boolean({ probability: 0.78 }) ? pickLocation() : {};
    const tags = generateTags(category);

    const popularity = faker.number.int({ min: 12, max: 98 });
    // Engagement slightly correlated
    const engagement = Math.max(8, Math.min(97, Math.round(popularity * 0.7 + faker.number.int({ min: -18, max: 22 }))));

    // New premium fields
    const signal_score = Math.max(20, Math.min(98, Math.round((popularity * 0.5 + engagement * 0.4 + faker.number.int({ min: -10, max: 15 })) / 1.1)));
    const is_nsfw = faker.datatype.boolean({ probability: 0.65 });
    const price = faker.datatype.boolean({ probability: 0.85 }) ? faker.number.int({ min: 4, max: 49 }) : undefined;
    const is_free = !price && faker.datatype.boolean({ probability: 0.3 });
    const last_active = faker.date.recent({ days: faker.number.int({ min: 1, max: 45 }) }).toISOString();

    const updated = faker.date.recent({ days: 120 }).toISOString();

    const primary = faker.helpers.arrayElement(PLATFORMS);

    const creator: Creator = {
      id: faker.string.uuid(),
      username,
      display_name,
      bio: generateBio(display_name, category, tags),
      avatar_url: `https://picsum.photos/id/${(i % 60) + 10}/320/320`,
      profile_image_url: `https://picsum.photos/id/${(i % 60) + 10}/320/320`,
      category,
      tags,
      ...loc,
      country: (loc as any).location_country,
      city: (loc as any).location_city,
      popularity_score: popularity,
      engagement_score: engagement,
      signal_score,
      primary_platform: primary,
      price_monthly: price,
      is_free,
      is_nsfw,
      last_active_at: last_active,
      platforms: randomPlatforms(username),
      updated_at: updated,
    };
    creators.push(creator);
  }

  // Boost a few "trending" creators
  const boostIndexes = [3, 17, 41, 58, 82, 109, 133];
  boostIndexes.forEach((idx) => {
    if (creators[idx]) {
      creators[idx].popularity_score = Math.min(99, creators[idx].popularity_score + 12);
      creators[idx].engagement_score = Math.min(98, creators[idx].engagement_score + 9);
    }
  });

  return creators;
}

// Generate once at module load for the app lifetime (fast + stable for demo/prod small scale)
export const ALL_CREATORS: Creator[] = generateCreators();

// Quick lookup by username (case insensitive)
export const CREATOR_BY_USERNAME = new Map(
  ALL_CREATORS.map((c) => [c.username.toLowerCase(), c])
);

export function getCreatorByUsername(username: string): Creator | undefined {
  return CREATOR_BY_USERNAME.get(username.toLowerCase());
}
