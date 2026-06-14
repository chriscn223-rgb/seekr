import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-[#080B14] text-[#EDF0F8]">
      <Navbar />
      <div className="container py-12">
        {/* Stats bar */}
        <div className="flex flex-wrap gap-x-10 gap-y-2 text-sm mb-10 border-b border-[#1A2038] pb-6">
          <div><span className="font-mono text-[#F0A500]">23,418</span> creators indexed</div>
          <div><span className="font-mono text-[#F0A500]">71</span> countries</div>
          <div><span className="font-mono text-[#F0A500]">&lt;200ms</span> avg search</div>
        </div>

        <h1 className="h1 mb-3">About Seekr</h1>
        <p className="max-w-prose text-[#7B849C] text-lg">The precision search instrument for the creator economy.</p>

        {/* Philosophy cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            { icon: "🔎", title: "Precision over popularity", body: "We surface the exact match using signal, engagement, and real-time data — not follower count alone." },
            { icon: "🔒", title: "Public data only", body: "No private messages, no paywalled content, no scraping. Only what creators choose to share publicly." },
            { icon: "⚡", title: "Built for speed", body: "Sub-200ms responses at scale. Every filter, every map interaction, every search is instant." },
          ].map((p, i) => (
            <div key={i} className="card p-5">
              <div className="text-2xl mb-3">{p.icon}</div>
              <div className="font-semibold mb-1">{p.title}</div>
              <p className="text-sm text-[#7B849C]">{p.body}</p>
            </div>
          ))}
        </div>

        {/* How indexing works — timeline */}
        <div className="mt-14">
          <div className="uppercase tracking-[1.5px] text-xs text-[#F0A500] mb-4">HOW A PROFILE GETS INDEXED</div>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            {["Creator submits", "Manual + automated review", "Geocode + enrich", "Live in search & map"].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="mt-0.5 w-5 h-5 rounded-full border border-[#F0A500] text-[10px] flex items-center justify-center text-[#F0A500]">{i+1}</div>
                <div>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-sm">
          <Link href="/submit" className="btn btn-primary">Submit your profile →</Link>
          <span className="ml-4 text-[#7B849C]">or <Link href="/" className="underline hover:no-underline">back to search</Link></span>
        </div>
      </div>
    </div>
  );
}
