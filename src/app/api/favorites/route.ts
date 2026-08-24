import { NextRequest, NextResponse } from "next/server";
import { toggleFavorite } from "@/lib/data";
import { requireAuth, AuthError } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const storeId = (body as Record<string, unknown>)?.storeId;
  if (typeof storeId !== "number" || !Number.isInteger(storeId) || storeId < 1) {
    return NextResponse.json({ error: "storeId deve ser um inteiro positivo" }, { status: 400 });
  }

  const favorited = await toggleFavorite(storeId, user.id);
  return NextResponse.json({ favorited });
}
