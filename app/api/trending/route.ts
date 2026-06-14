import { NextResponse } from "next/server";
import { getTrending } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET() {
  const trending = getTrending(14);
  return NextResponse.json(trending, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
