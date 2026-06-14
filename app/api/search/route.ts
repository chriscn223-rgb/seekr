import { NextRequest, NextResponse } from "next/server";
import { searchCreators } from "@/lib/search";
import { SearchFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filters: SearchFilters = {
    query: searchParams.get("query") || undefined,
    category: searchParams.get("category") || undefined,
    tags: searchParams.getAll("tags").length ? searchParams.getAll("tags") : undefined,
    platforms: searchParams.getAll("platforms").length ? searchParams.getAll("platforms") : undefined,
    minPopularity: searchParams.get("minPopularity") ? Number(searchParams.get("minPopularity")) : undefined,
    minEngagement: searchParams.get("minEngagement") ? Number(searchParams.get("minEngagement")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined,
    radiusKm: searchParams.get("radius") ? Number(searchParams.get("radius")) : undefined,
    sort: (searchParams.get("sort") as any) || "relevance",
  };

  try {
    const result = await searchCreators(filters);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=45, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Search error", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
