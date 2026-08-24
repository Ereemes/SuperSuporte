import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, setAuthCookie, auditLog, getClientIp } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const email = body.email?.toLowerCase().trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha obrigatorios" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user || !user.active) {
    return NextResponse.json({ error: "E-mail ou senha invalidos" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "E-mail ou senha invalidos" }, { status: 401 });
  }

  const token = await createToken(user.id);
  await setAuthCookie(token);

  const ip = getClientIp(request);
  await auditLog(user.id, "login", "auth", null, ip);

  return NextResponse.json({ ok: true });
}
