import { NextRequest, NextResponse } from "next/server";
import { getNearby } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius") || 80);

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const results = getNearby(lat, lng, Math.min(250, Math.max(5, radius)), 80);
  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
