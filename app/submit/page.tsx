"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

export default function SubmitProfile() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "", display_name: "", bio: "",
    location_city: "", location_country: "",
    primary_platform: "OnlyFans", price_monthly: "",
    is_nsfw: false, tags: "", category: "",
  });

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const submit = () => {
    // Simulate adding to the live index for this demo
    const demoCreator = {
      id: 'user-' + Date.now(),
      username: form.username || `user${Date.now().toString().slice(-4)}`,
      display_name: form.display_name || form.username,
      bio: form.bio || 'Newly submitted creator profile.',
      avatar_url: 'https://picsum.photos/id/1005/320/320',
      category: form.category || 'Lifestyle',
      tags: (form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : ['new']),
      location_city: form.location_city || 'Remote',
      location_country: form.location_country || 'Global',
      lat: 40.7 + (Math.random() - 0.5) * 1.5,
      lng: -74 + (Math.random() - 0.5) * 2,
      popularity_score: 70,
      engagement_score: 75,
      signal_score: 82,
      primary_platform: form.primary_platform,
      price_monthly: form.price_monthly ? parseInt(form.price_monthly) : undefined,
      is_free: !form.price_monthly,
      is_nsfw: form.is_nsfw,
      last_active_at: new Date().toISOString(),
      platforms: [{ 
        name: form.primary_platform, 
        url: `https://example.com/${form.username}`, 
        price: form.price_monthly ? parseInt(form.price_monthly) : undefined 
      }],
      updated_at: new Date().toISOString(),
      _score: 0.95,
    };

    let demos = [];
    try {
      demos = JSON.parse(localStorage.getItem('seekr_demo_creators') || '[]');
    } catch {}
    demos = [demoCreator, ...demos].slice(0, 5); // keep recent
    localStorage.setItem('seekr_demo_creators', JSON.stringify(demos));

    toast.success("Profile submitted for review. Thank you! (Demo added to this session's results)");
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-[#EDF0F8]">
      <Navbar />
      <div className="container py-10 max-w-md">
        <div className="mb-6">
          <div className="label text-[#F0A500]">CREATOR PORTAL</div>
          <h1 className="h2">Submit your profile</h1>
        </div>

        {/* Amber step indicator */}
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded ${s <= step ? 'bg-[#F0A500]' : 'bg-[#1A2038]'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="card p-6 space-y-4">
            <div><label className="label">Username / Handle</label><input className="input" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></div>
            <div><label className="label">Display Name</label><input className="input" value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})} /></div>
            <div><label className="label">Short Bio</label><textarea className="input h-20" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} /></div>
            <button onClick={next} className="btn btn-primary w-full mt-2">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">City</label><input className="input" value={form.location_city} onChange={e=>setForm({...form,location_city:e.target.value})} /></div>
              <div><label className="label">Country</label><input className="input" value={form.location_country} onChange={e=>setForm({...form,location_country:e.target.value})} /></div>
            </div>
            <div>
              <label className="label">Primary Platform</label>
              <select className="input" value={form.primary_platform} onChange={e=>setForm({...form,primary_platform:e.target.value})}>
                {["OnlyFans","Fansly","Patreon","Instagram","TikTok","Twitch","YouTube","X"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Monthly Price (leave blank if free)</label><input type="number" className="input" value={form.price_monthly} onChange={e=>setForm({...form,price_monthly:e.target.value})} /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={back} className="btn btn-ghost flex-1">Back</button>
              <button onClick={next} className="btn btn-primary flex-1">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_nsfw} onChange={e=>setForm({...form,is_nsfw:e.target.checked})} id="nsfw" />
              <label htmlFor="nsfw" className="text-sm">This is adult / NSFW content</label>
            </div>
            <div>
              <label className="label">Primary category / niche</label>
              <input className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Gaming" />
            </div>
            <div>
              <label className="label">Niche / Tags (comma separated)</label>
              <input className="input" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="cosplay, fitness, ASMR" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={back} className="btn btn-ghost flex-1">Back</button>
              <button onClick={submit} className="btn btn-primary flex-1">Submit for review</button>
            </div>
            <p className="text-center text-xs text-[#7B849C]">All submissions are manually reviewed.</p>
          </div>
        )}

        {step === 4 && (
          <div className="card p-8 text-center">
            <div className="text-3xl mb-3">✓</div>
            <div className="text-xl font-semibold mb-2">Thank you.</div>
            <p className="text-[#7B849C]">We will review and index your profile within 24–48 hours.</p>
          <p className="text-xs text-[#7B849C] mt-2">For this demo, use the "+ Add demo creator" button on the main search page to see a simulated submission appear in results instantly.</p>
            <Link href="/" className="btn btn-ghost mt-6">Back to search</Link>
          </div>
        )}
      </div>
    </div>
  );
}
