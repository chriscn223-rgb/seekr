"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Copy, Bookmark, ExternalLink } from "lucide-react";
import { RankedCreator } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  creator: RankedCreator;
  isSelected?: boolean;
  onCardClick?: (c: RankedCreator) => void;
}

export default function CreatorCard({ creator, isSelected, onCardClick }: Props) {
  const router = useRouter();
  const loc = [creator.location_city, creator.location_state, creator.location_country]
    .filter(Boolean)
    .join(", ");

  const topPlatforms = creator.platforms.slice(0, 3);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/creator/${creator.username}`);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/creator/${creator.username}`);
    toast.success("Link copied");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Simple local "save" - can be extended to localStorage list later
    const key = "seekr_saved";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    if (!current.includes(creator.username)) {
      localStorage.setItem(key, JSON.stringify([...current, creator.username]));
    }
    toast.success(`Saved ${creator.display_name}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(creator);
    }
  };

  const engagementLevel = creator.engagement_score > 75 ? "green" : creator.engagement_score > 50 ? "yellow" : "red";

  const lastActive = new Date(creator.last_active_at || creator.updated_at);
  const daysAgo = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  const activeLabel = daysAgo < 1 ? "Active today" : daysAgo < 7 ? "Active this week" : "Active recently";

  // Platform icon helper (Simple Icons CDN - clean grayscale)
  const getPlatformIcon = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '');
    return `https://cdn.simpleicons.org/${slug}/a1a1aa`;
  };

  return (
    <Link 
      href={`/creator/${creator.username}`} 
      className={`block group creator-card card ${isSelected ? "ring-1 ring-[#6B9BF2]/60" : ""}`}
      onClick={handleProfileClick}
    >
      {/* Image: clean 4:3, no per-card cyan glow */}
      <div className="card-image">
        <img
          src={creator.avatar_url || creator.profile_image_url}
          alt={creator.display_name}
          className="absolute inset-0"
          loading="lazy"
        />
        
        {/* Platform badge (top left) */}
        {creator.primary_platform && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-[10px] px-1.5 py-0.5 rounded text-[#E5E7EB]">
            <img src={getPlatformIcon(creator.primary_platform)} alt="" className="w-3 h-3" />
            <span>{creator.primary_platform}</span>
          </div>
        )}
        
        {/* 18+ badge if applicable */}
        {creator.is_nsfw && (
          <div className="absolute top-2 right-2 bg-[#F87171] text-[10px] text-black px-1.5 py-px rounded font-medium tracking-[0.5px]">18+</div>
        )}
      </div>

      <div className="body">
        <div className="flex justify-between items-start">
          <div>
            <div className="username">@{creator.username}</div>
            <div className="display">{creator.display_name}</div>
          </div>
          <div className="text-right text-[11px] text-[#F0A500] tabular-nums font-medium">
            {creator.signal_score}
          </div>
        </div>

        {loc && (
          <div className="location flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {loc}
          </div>
        )}

        {/* Flat text tags (no individual pills) */}
        <div className="tags text-[11px] mt-2">
          {creator.tags.slice(0, 3).map((t, i) => <span key={i}>{t}</span>)}
          {creator.is_nsfw && <span>18+</span>}
        </div>

        {/* Meta row with platform icons + price */}
        <div className="meta">
          <div className="flex gap-1.5">
            {topPlatforms.slice(0, 2).map((p, i) => (
              <img key={i} src={getPlatformIcon(p.name)} alt={p.name} className="w-3.5 h-3.5 opacity-70" />
            ))}
          </div>
          <div className="flex-1" />
          {creator.is_free ? (
            <span className="price text-[#34D399]">Free</span>
          ) : creator.price_monthly ? (
            <span className="price">from ${creator.price_monthly}</span>
          ) : null}
        </div>
      </div>

      {/* Hover actions — amber primary CTA */}
      <div className="hover-actions" onClick={e => e.stopPropagation()}>
        <button onClick={handleOpen} className="hover-btn flex-1">View profile</button>
        <button onClick={handleCopy} className="hover-btn secondary">Share</button>
        <button onClick={handleSave} className="hover-btn secondary">Save</button>
      </div>
    </Link>
  );
}
