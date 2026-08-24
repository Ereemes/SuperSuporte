import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getAuthUser, auditLog, getClientIp } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (user) {
    const ip = getClientIp(request);
    await auditLog(user.id, "logout", "auth", null, ip);
  }

  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
