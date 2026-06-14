import { Suspense } from "react";
import SeekrSearchClient from "@/components/SeekrSearchClient";

export default function SeekrHome() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-[#666]">Loading seekr…</div>}>
      <SeekrSearchClient />
    </Suspense>
  );
}
