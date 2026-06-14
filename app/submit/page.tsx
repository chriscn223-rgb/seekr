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
    is_nsfw: false, tags: "",
  });

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const submit = () => {
    console.log("Submission:", form);
    toast.success("Profile submitted for review. Thank you!");
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
            <Link href="/" className="btn btn-ghost mt-6">Back to search</Link>
          </div>
        )}
      </div>
    </div>
  );
}
