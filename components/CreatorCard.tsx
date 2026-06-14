"use client";

import Link from "next/link";
import { MapPin, Copy, Bookmark, ExternalLink } from "lucide-react";
import { RankedCreator } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  creator: RankedCreator;
  isSelected?: boolean;
  onCardClick?: (c: RankedCreator) => void;
}

export default function CreatorCard({ creator, isSelected, onCardClick }: Props) {
  const loc = [creator.location_city, creator.location_state, creator.location_country]
    .filter(Boolean)
    .join(", ");

  const topPlatforms = creator.platforms.slice(0, 3);

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

  return (
    <Link 
      href={`/creator/${creator.username}`} 
      className={`block group creator-card card ${isSelected ? "ring-1 ring-[#3BF5FF]/70" : ""}`}
      onClick={handleProfileClick}
    >
      {/* Image */}
      <div className="card-image">
        <img
          src={creator.profile_image_url}
          alt={creator.display_name}
          className="absolute inset-0"
          loading="lazy"
        />
        
        {/* Subtle badges */}
        {creator.popularity_score > 85 && (
          <div className="image-badge">Trending</div>
        )}
        {creator.platforms[0] && (
          <div className="image-badge" style={{ left: "auto", right: "10px" }}>
            {creator.platforms[0].name}
          </div>
        )}
      </div>

      {/* Body */}
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

        {/* Tags */}
        <div className="card-tags">
          <span className="tag accent">{creator.category}</span>
          {creator.tags.slice(0, 2).map((t, i) => (
            <span key={i} className="tag">{t}</span>
          ))}
        </div>

        {/* Platform badges */}
        <div className="platform-badges">
          {topPlatforms.map((p, i) => (
            <span key={i} className="platform-badge">{p.name}</span>
          ))}
          {creator.platforms.length > 3 && <span className="platform-badge">+{creator.platforms.length - 3}</span>}
        </div>

        {/* Metrics */}
        <div className="metrics">
          <div className="metric">
            <span>Pop</span> 
            <span className="font-mono text-[#F9FAFB]">{creator.popularity_score}</span>
          </div>
          <div className="metric">
            <span>Eng</span>
            <span className={`dot ${engagementLevel}`} />
          </div>
          {creator.platforms.some(p => p.price) && (
            <div className="metric text-[#3BF5FF]">
              from ${Math.min(...creator.platforms.filter(p => p.price).map(p => p.price!))}
            </div>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="hover-actions" onClick={e => e.stopPropagation()}>
        <a 
          href={`/creator/${creator.username}`} 
          className="hover-btn"
          onClick={handleProfileClick}
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </a>
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
