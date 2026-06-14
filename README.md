# seekr

**The fastest, cleanest, most accurate creator search engine.**

Search creators → View beautiful public profiles → Nothing else.

- No login
- No monetization / paywalls / ads
- No messaging or creator dashboards
- Pure search + profile discovery

Built to be **better, faster, and cleaner** than OnlySeeker, FansList, OnlySearch, etc.

## ✨ Core Features

- **Instant Global Search**: Names, usernames, tags, niches, categories, locations, bios, keywords
- **Fuzzy + Typo Tolerant**: Powered by Orama (embedded). Prefix, typo tolerance, relevance boosting on username/display/tags
- **Advanced Ranking**: Custom weighted formula:
  ```
  score = (text_relevance × 0.45) + (popularity × 0.22) + (engagement × 0.20) + (location_proximity × 0.08) + (tag/category match × 0.05)
  ```
- **Powerful Filters**: Category, tags (multi), platforms, min popularity/engagement, price caps, geo radius
- **Map Search**: Full interactive Leaflet + clustering. "Near me" support using browser geolocation + radius
- **Creator Profile Pages**: SEO-optimized, clean, fast. JSON-LD schema, dynamic OG, clean URLs `/creator/username`
- **Autocomplete**: Real-time suggestions as you type
- **Trending + Categories**: Instant discovery on homepage
- **URL-driven state**: Fully shareable searches and filters
- **Mobile-first**, ultra-clean whitespace design

## 🛠️ Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Orama (embedded, zero-dependency ultra-fast search engine with geo + facets)
- Leaflet + react-leaflet + marker clustering (map)
- Pure synthetic data (150 realistic creators generated with @faker-js/faker)
- Server + client components, streaming friendly
- Full REST API under `/api/*` (search, creator, trending, nearby, categories)

**Production ready for Vercel / Fly / Render.**

## 🚀 Quick Start

```bash
cd Projects/seekr

npm install
npm run dev
```

Open http://localhost:3000

Everything runs instantly with zero external services.

### Useful commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Run built production server
npm run test         # Run ranking + search tests
npm run seed         # Regenerate seed snapshot (optional)
npm run typecheck    # TypeScript check
```

## 📁 Project Structure

```
app/
  api/                 # REST endpoints (search, creator, etc)
  creator/[username]/  # Dynamic SEO profile pages
  layout.tsx           # Root metadata + Toaster
  page.tsx             # The entire search experience (grid + map + filters)
  sitemap.ts
  robots.ts
components/
  Navbar, SearchBar (with autocomplete), Filters, CreatorCard, MapView, etc.
lib/
  constants.ts
  ranking.ts           # The production scoring + haversine
  search.ts           # Orama engine + search + facets + autocomplete
  seed.ts              # 148 realistic fictional creators + lookup
  types.ts
```

## 🔍 Search & Ranking Details

- Orama handles initial fuzzy retrieval (extremely fast)
- We then re-score every result with the full weighted formula above
- Geo uses haversine + proximity decay
- Username + display name heavily boosted
- Tag & category exact matches give extra lift
- Multiple sort modes supported on top of scoring

## 🗺️ Map & Geo

- Leaflet + OpenStreetMap (no API keys)
- Marker clustering for hundreds of pins
- "Near me" uses `navigator.geolocation`
- Radius filtering works in both grid and map views
- Location data is fictional but realistic

## 📈 SEO

- Server-rendered profile pages with dynamic metadata
- Full OpenGraph + Twitter cards per creator (profile image)
- JSON-LD `Person` schema markup on every profile
- `app/sitemap.ts` generates complete sitemap (all creators)
- Clean shareable URLs + filter state in query params

## 🧪 Data & Importer

All data is **synthetic and fictional** (no real people scraped).

- `lib/seed.ts` — deterministic faker generator (~150 creators)
- Run `npm run seed` to create a JSON snapshot if you want to customize
- Easy to swap the generator for a real importer later:
  - Public profile scraping (respect robots + rate limits)
  - Normalize → auto-categorize → auto-tag → geocode (Mapbox/Nominatim)
  - Bulk insert into Orama or Postgres+Meilisearch

To upgrade to real production data layer (recommended at scale):

1. Add Drizzle + Postgres + PostGIS
2. Replace Orama index with Meilisearch or Elasticsearch
3. Keep the same ranking layer and API shape

## 🧪 Tests

```bash
npm test
```

Covers:
- Haversine + scoring formula correctness
- Search engine + ranking integration + geo filtering

## 🚢 Deployment

**Vercel (recommended)**:

1. Push to GitHub
2. Import project on Vercel
3. Done. Zero config.

Other platforms (Fly.io, Render, Railway) also work perfectly.

For global scale you can later:
- Move creators into Postgres (Drizzle already compatible)
- Use Meilisearch (Docker one-liner) or Orama Cloud
- Add edge caching on search responses

## 🔒 Philosophy & Scope (Strict)

- Search-only + profile-only
- Zero accounts, zero payments, zero ads, zero private data
- Every feature exists only to make **Search creators → View creator pages** better

## 📄 License

MIT — use it, improve it, deploy your own instance.

---

**seekr** — Built for speed, accuracy, and a delightful clean experience.
