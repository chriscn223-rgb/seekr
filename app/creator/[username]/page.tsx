import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getCreatorByUsername } from "@/lib/seed";
import { Calendar, MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Props {
  params: Promise<{ username: string }>;
}

// Dynamic SEO per creator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const creator = getCreatorByUsername(username);

  if (!creator) {
    return {
      title: "Creator not found | seekr",
    };
  }

  const title = `${creator.display_name} (@${creator.username}) — ${creator.category} | seekr`;
  const description = creator.bio.slice(0, 155) + (creator.bio.length > 155 ? "…" : "");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: creator.profile_image_url }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CreatorPage({ params }: Props) {
  const { username } = await params;
  const creator = getCreatorByUsername(username);

  if (!creator) {
    notFound();
  }

  const location = [creator.location_city, creator.location_state, creator.location_country]
    .filter(Boolean)
    .join(", ");

  const lastUpdated = new Date(creator.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // JSON-LD structured data (Person + profile)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: creator.display_name,
    alternateName: creator.username,
    description: creator.bio,
    image: creator.profile_image_url,
    knowsAbout: [creator.category, ...creator.tags],
    ...(location && { homeLocation: { "@type": "Place", name: location } }),
    url: `https://seekr.example/creator/${creator.username}`, // update on real domain
    sameAs: creator.platforms.map((p) => p.url),
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-[#F9FAFB]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-5 pt-8 pb-20">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>

        <div className="card overflow-hidden">
          {/* Hero image + basic info */}
          <div className="relative h-72 bg-[#050814]">
            <img
              src={creator.profile_image_url}
              alt={creator.display_name}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#05060A]" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-5xl font-semibold tracking-tighter">{creator.display_name}</div>
                  <div className="text-[#9CA3AF] text-2xl">@{creator.username}</div>
                </div>
                <div className="text-right text-sm font-mono opacity-90 hidden sm:block text-[#3BF5FF]">
                  POP {creator.popularity_score} &nbsp;•&nbsp; ENG {creator.engagement_score}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-5 gap-x-10 gap-y-8">
            {/* Left: Bio + location + meta */}
            <div className="md:col-span-3">
              <div className="uppercase tracking-[1.5px] text-xs text-[#9CA3AF] mb-1">BIO</div>
              <p className="text-[17px] leading-snug text-[#E5E7EB]">{creator.bio}</p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-[#9CA3AF] mb-1">
                    <MapPin className="w-4 h-4" /> LOCATION
                  </div>
                  <div className="font-medium">{location || "Not specified"}</div>
                  {creator.lat && creator.lng && (
                    <div className="text-xs text-[#9CA3AF] mt-0.5 tabular-nums">
                      {creator.lat.toFixed(3)}, {creator.lng.toFixed(3)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#9CA3AF] mb-1">
                    <Calendar className="w-4 h-4" /> LAST UPDATED
                  </div>
                  <div className="font-medium">{lastUpdated}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">Public data only</div>
                </div>
              </div>

              {/* Tags & Category */}
              <div className="mt-8">
                <div className="uppercase tracking-[1.5px] text-xs text-[#9CA3AF] mb-2">NICHE &amp; TAGS</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-4 py-1 bg-[#3BF5FF] text-[#05060A] text-sm rounded-3xl font-medium">{creator.category}</span>
                  {creator.tags.map((t, idx) => (
                    <span key={idx} className="tag px-3 py-px text-sm">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Scores + Platforms */}
            <div className="md:col-span-2">
              <div>
                <div className="uppercase tracking-[1.5px] text-xs text-[#9CA3AF] mb-3">POPULARITY &amp; ENGAGEMENT</div>
                <div className="flex gap-3">
                  <div className="flex-1 border border-[#1F2937] rounded-2xl p-4">
                    <div className="text-4xl font-semibold tabular-nums tracking-[-1.5px] text-[#3BF5FF]">{creator.popularity_score}</div>
                    <div className="text-[#9CA3AF] text-sm">Popularity score</div>
                  </div>
                  <div className="flex-1 border border-[#1F2937] rounded-2xl p-4">
                    <div className="text-4xl font-semibold tabular-nums tracking-[-1.5px] text-[#3BF5FF]">{creator.engagement_score}</div>
                    <div className="text-[#9CA3AF] text-sm">Engagement score</div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="uppercase tracking-[1.5px] text-xs text-[#9CA3AF] mb-3">WHERE TO FIND THEM</div>
                <div className="space-y-2">
                  {creator.platforms.map((p, index) => (
                    <a
                      key={index}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="platform-link w-full justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        {p.name}
                        {p.price && <span className="text-xs text-[#9CA3AF]">from ${p.price}/mo</span>}
                      </span>
                      <ExternalLink className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#3BF5FF] transition" />
                    </a>
                  ))}
                </div>
                <div className="mt-4 text-[11px] text-[#9CA3AF]">
                  Links open externally. All data is publicly indexed.
                </div>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div className="border-t border-[#1F2937] bg-[#050814] px-8 py-4 text-xs text-[#9CA3AF] flex items-center justify-between">
            <div>Search-only. No messaging or subscriptions on seekr.</div>
            <Link href="/" className="hover:text-white underline underline-offset-2">Back to search</Link>
          </div>
        </div>

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </div>
  );
}
