"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

export default function SubmitProfile() {
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    bio: "",
    location_city: "",
    location_country: "",
    primary_platform: "OnlyFans",
    price_monthly: "",
    is_nsfw: false,
    category: "Lifestyle",
    tags: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real version this would POST to /api/creators
    console.log("Self-submission received:", form);
    toast.success("Profile submitted for review. Thank you!");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#05060A] text-[#F9FAFB]">
        <Navbar />
        <div className="container py-16 max-w-md">
          <h1 className="h1 mb-4">Thank you!</h1>
          <p className="text-[#9CA3AF] mb-6">Your profile has been received. We will review and index it within 24-48 hours.</p>
          <Link href="/" className="btn-primary inline-block">Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060A] text-[#F9FAFB]">
      <Navbar />
      <div className="container py-10 max-w-lg">
        <div className="mb-8">
          <div className="label tracking-[2px] text-[#3BF5FF]">CREATOR PORTAL</div>
          <h1 className="h1">Submit your profile</h1>
          <p className="text-[#9CA3AF] mt-2">Join thousands of creators being discovered on Seekr. All submissions are manually reviewed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 card p-6">
          <div>
            <label className="label mb-1 block">Username / Handle</label>
            <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5" placeholder="@yourhandle" />
          </div>

          <div>
            <label className="label mb-1 block">Display Name</label>
            <input required value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5" />
          </div>

          <div>
            <label className="label mb-1 block">Short Bio</label>
            <textarea required value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5 h-20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1 block">City</label>
              <input value={form.location_city} onChange={e => setForm({...form, location_city: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="label mb-1 block">Country</label>
              <input value={form.location_country} onChange={e => setForm({...form, location_country: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1 block">Primary Platform</label>
              <select value={form.primary_platform} onChange={e => setForm({...form, primary_platform: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5">
                <option>OnlyFans</option><option>Fansly</option><option>Patreon</option><option>Instagram</option><option>TikTok</option><option>Twitch</option><option>YouTube</option><option>X</option>
              </select>
            </div>
            <div>
              <label className="label mb-1 block">Monthly Price (USD)</label>
              <input type="number" value={form.price_monthly} onChange={e => setForm({...form, price_monthly: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5" placeholder="Leave blank if free" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_nsfw} onChange={e => setForm({...form, is_nsfw: e.target.checked})} /> This is adult / NSFW content
            </label>
          </div>

          <div>
            <label className="label mb-1 block">Niche / Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full bg-[#050814] border border-[#1F2937] rounded-lg px-4 py-2.5" placeholder="fitness, cosplay, ASMR" />
          </div>

          <button type="submit" className="btn-primary w-full mt-4">Submit for review</button>
          <p className="text-center text-xs text-[#9CA3AF]">We manually review all submissions to keep quality high.</p>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[#9CA3AF] hover:text-white text-sm">← Back to search</Link>
        </div>
      </div>
    </div>
  );
}
