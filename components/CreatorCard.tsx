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

  return (
    <Link 
      href={`/creator/${creator.username}`} 
      className={`block group creator-card card ${isSelected ? "ring-1 ring-[#3BF5FF]/70" : ""}`}
      onClick={handleProfileClick}
    >
      {/* Image - 4:5 premium ratio */}
      <div className="card-image" style={{ aspectRatio: "4 / 5" }}>
        <img
          src={creator.avatar_url || creator.profile_image_url}
          alt={creator.display_name}
          className="absolute inset-0"
          loading="lazy"
        />
        
        {/* Gradient overlay for text legibility on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
        
        {/* Premium badges */}
        {creator.is_nsfw && (
          <div className="image-badge" style={{ background: "rgba(249,115,115,0.9)", borderColor: "#F97373", color: "white" }}>[18+]</div>
        )}
        {creator.signal_score > 85 && (
          <div className="image-badge" style={{ left: "auto", right: "10px" }}>Top signal</div>
        )}
        {creator.primary_platform && (
          <div className="image-badge" style={{ left: "auto", right: "10px", top: creator.is_nsfw || creator.signal_score > 85 ? "32px" : "10px" }}>
            {creator.primary_platform}
          </div>
        )}
      </div>

      {/* Body - premium layout */}
      <div className="card-body">
        <div>
          <div className="card-username">{creator.username}</div>
          <div className="card-display">{creator.display_name}</div>
        </div>

        {loc && (
          <div className="card-location">
            <MapPin className="w-3.5 h-3.5" /> 
            <span className="truncate">{loc}</span>
          </div>
        )}

        {/* Short bio */}
        <div className="mt-1.5 text-[12px] text-[#9CA3AF] line-clamp-2 leading-snug">{creator.bio}</div>

        {/* Tags */}
        <div className="card-tags">
          <span className="tag accent">{creator.category}</span>
          {creator.tags.slice(0, 2).map((t, i) => (
            <span key={i} className="tag">{t}</span>
          ))}
        </div>

        {/* Platform icons + price/Free */}
        <div className="platform-badges mt-2">
          {topPlatforms.map((p, i) => (
            <span key={i} className="platform-badge">{p.name}</span>
          ))}
          {creator.platforms.length > 3 && <span className="platform-badge">+{creator.platforms.length - 3}</span>}
          {creator.is_free ? (
            <span className="platform-badge" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", borderColor: "rgba(34,197,94,0.3)" }}>Free</span>
          ) : creator.price_monthly ? (
            <span className="platform-badge">from ${creator.price_monthly}</span>
          ) : null}
        </div>

        {/* Premium metrics + trust signals */}
        <div className="metrics mt-auto pt-2.5">
          <div className="metric">
            <span>Signal</span> 
            <span className="font-mono text-[#3BF5FF] font-semibold">{creator.signal_score}</span>
          </div>
          <div className="metric text-[11px]">
            <span className="text-[#22C55E]">●</span> {activeLabel}
          </div>
          <div className="metric text-xs">
            Pop <span className="font-mono text-[#F9FAFB]">{creator.popularity_score}</span>
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div className="hover-actions" onClick={e => e.stopPropagation()}>
        <button 
          onClick={handleOpen}
          className="hover-btn"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </button>
        <button onClick={handleCopy} className="hover-btn">
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
        <button onClick={handleSave} className="hover-btn">
          <Bookmark className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </Link>
  );
}
