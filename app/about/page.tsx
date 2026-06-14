import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-[#05060A] text-[#F9FAFB]">
      <Navbar />
      <div className="container py-12 max-w-2xl">
        <h1 className="h1 mb-6">About Seekr</h1>
        
        <div className="prose prose-invert text-[#E5E7EB]">
          <p>Seekr is the fastest, cleanest creator discovery engine. We index public profiles so fans and collaborators can find creators instantly across platforms — with no noise, no logins, and no ads.</p>

          <h2 className="mt-8">Our philosophy</h2>
          <ul>
            <li>Search-only + profile-only</li>
            <li>Zero accounts, zero paywalls, zero messaging</li>
            <li>Real data from creator submissions + public sources (always with consent)</li>
            <li>Transparent, fast, and privacy-respecting</li>
          </ul>

          <h2 className="mt-8">How it works</h2>
          <p>Creators submit their profiles through our form. We verify, enrich with public data where allowed, geocode locations, and index everything into a high-performance search engine (currently Orama, with a clear path to Meilisearch at scale).</p>

          <h2 className="mt-8">Data &amp; trust</h2>
          <p>We only surface public information. No private content is hosted or proxied. Adult creators are clearly tagged with [18+]. Users can filter them out.</p>

          <div className="mt-10">
            <Link href="/submit" className="btn-primary">Submit your profile →</Link>
            <span className="ml-4 text-sm text-[#9CA3AF]">or <Link href="/" className="underline">back to search</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
