import { NextRequest, NextResponse } from "next/server";
import { toggleFavorite } from "@/lib/data";

export async function POST(request: NextRequest) {
  const { storeId } = await request.json();
  const favorited = toggleFavorite(storeId);
  return NextResponse.json({ favorited });
}
