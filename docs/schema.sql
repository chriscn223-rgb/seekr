-- Seekr PostgreSQL schema (recommended for production)
-- Run this in your Postgres (or adapt for Supabase/Neon)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;  -- for geo if desired

CREATE TYPE platform_enum AS ENUM (
  'onlyfans', 'fansly', 'patreon', 'instagram', 'tiktok', 
  'twitch', 'youtube', 'x', 'reddit', 'other'
);

CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  country TEXT,
  city TEXT,
  lat NUMERIC,
  lng NUMERIC,
  primary_platform platform_enum,
  price_monthly NUMERIC,
  is_free BOOLEAN DEFAULT FALSE,
  is_nsfw BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ,
  popularity_score INT CHECK (popularity_score BETWEEN 0 AND 100) DEFAULT 50,
  engagement_score INT CHECK (engagement_score BETWEEN 0 AND 100) DEFAULT 50,
  signal_score INT CHECK (signal_score BETWEEN 0 AND 100) DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE creator_platform_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  platform platform_enum NOT NULL,
  handle TEXT,
  url TEXT NOT NULL,
  followers INT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'niche'
);

CREATE TABLE creator_tags (
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (creator_id, tag_id)
);

-- Helpful indexes
CREATE INDEX idx_creators_username ON creators USING GIN (to_tsvector('english', username));
CREATE INDEX idx_creators_bio ON creators USING GIN (to_tsvector('english', bio));
CREATE INDEX idx_creators_location ON creators (country, city);
CREATE INDEX idx_creators_scores ON creators (popularity_score, engagement_score, signal_score);
CREATE INDEX idx_creators_nsfw ON creators (is_nsfw);
CREATE INDEX idx_creators_active ON creators (last_active_at);

-- Geospatial (optional)
-- CREATE INDEX idx_creators_geo ON creators USING GIST (ll_to_earth(lat, lng));
