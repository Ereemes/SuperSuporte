import { NextRequest, NextResponse } from "next/server";
import { getStores } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const result = getStores({
    q: searchParams.get("q") || undefined,
    status: searchParams.get("status") || undefined,
    uf: searchParams.get("uf") || undefined,
    regional: searchParams.get("regional") || undefined,
    ambiente: searchParams.get("ambiente") || undefined,
    unidade: searchParams.get("unidade") || undefined,
    favoritesOnly: searchParams.get("favorites") === "true",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
  });

  return NextResponse.json(result);
}
