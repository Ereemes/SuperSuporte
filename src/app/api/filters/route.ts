import { NextResponse } from "next/server";
import { getFilterOptions } from "@/lib/data";
import { requireAuth, AuthError } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  return NextResponse.json(getFilterOptions());
}
