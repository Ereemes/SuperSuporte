import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, setAuthCookie, auditLog, getClientIp } from "@/lib/api-auth";

const DUMMY_HASH = "$2b$10$c1w4NHnoC4UxGt7v0e8GUOGXZ7VKBmCUmbBWZpYtepPgkiJ8ECyPq";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request) || request.headers.get("host") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde 1 minuto." },
      { status: 429 }
    );
  }

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

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.active) {
      await bcrypt.compare(password, DUMMY_HASH);
      return NextResponse.json({ error: "E-mail ou senha invalidos" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "E-mail ou senha invalidos" }, { status: 401 });
    }

    const token = await createToken(user.id);
    await setAuthCookie(token);

    await auditLog(user.id, "login", "auth", null, ip);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[login] erro interno:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Erro interno do servidor", detail }, { status: 500 });
  }
}
