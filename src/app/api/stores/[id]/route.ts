import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { requireAuth, AuthError } from "@/lib/api-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { id } = await params;
  const store = getStore(parseInt(id, 10), user.id);

  if (!store) {
    return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  }

  return NextResponse.json(store);
}
