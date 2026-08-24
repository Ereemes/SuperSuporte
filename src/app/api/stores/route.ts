import { NextRequest, NextResponse } from "next/server";
import { getStores } from "@/lib/data";
import { requireAuth, AuthError } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { searchParams } = request.nextUrl;

  const result = getStores({
    q: searchParams.get("q") || undefined,
    status: searchParams.get("status") || undefined,
    uf: searchParams.get("uf") || undefined,
    regional: searchParams.get("regional") || undefined,
    ambiente: searchParams.get("ambiente") || undefined,
    unidade: searchParams.get("unidade") || undefined,
    diretor: searchParams.get("diretor") || undefined,
    fornecedor: searchParams.get("fornecedor") || undefined,
    taxa: searchParams.get("taxa") === "true" || undefined,
    favoritesOnly: searchParams.get("favorites") === "true",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
    userId: user.id,
  });

  return NextResponse.json(result);
}
