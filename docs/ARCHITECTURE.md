# seekr Architecture

## Philosophy
Search-only. Profile-only. No accounts, payments, messaging, or dashboards.

## Layers

1. **Data Layer** (`lib/seed.ts`)
   - Deterministic faker generation of ~148 fictional creators
   - In-memory + Map for O(1) username lookup
   - Easy to replace with Postgres-backed loader

2. **Search Engine** (`lib/search.ts`)
   - Orama embedded index (create + insert on boot)
   - Powerful fuzzy + prefix + typo-tolerant retrieval
   - Faceted results + fast autocomplete

3. **Ranking** (`lib/ranking.ts`)
   - Production formula (see README)
   - Haversine distance for geo
   - Applied on top of Orama hits for perfect control

4. **API** (`app/api/*`)
   - Thin REST wrappers (great for future mobile / integrations)
   - Heavily cached where safe

5. **UI**
   - Next.js App Router RSC + "use client" islands
   - URL as source of truth (all filters + view state serializable)
   - Beautiful minimal components

## Scaling Path (when you outgrow 10k creators)
- Replace Orama with Meilisearch (almost drop-in for query shape)
- Swap seed for Drizzle + Postgres + PostGIS
- Add Redis for popular result caching
- Static generation for top profiles

## Why this beats the competition on speed/accuracy
- Embedded index = microsecond level after first request (no network)
- Custom multi-signal ranking tuned specifically for creator discovery
- Geo handled at two layers (filter + score boost)
- Zero network roundtrips for interactive search on client hydration
