import { NextResponse } from "next/server";
import { getCategoryCounts } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = getCategoryCounts();
  return NextResponse.json(categories, {
    headers: { "Cache-Control": "public, s-maxage=120" },
  });
}
