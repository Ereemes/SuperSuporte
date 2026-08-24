import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import type { Permission, ProfileType } from "./auth";

const COOKIE_NAME = "ss_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || "8h";
}

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(getExpiresIn())
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  profileType: ProfileType;
  profileLabel: string;
  permissions: Permission[];
  initials: string;
}

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      profile: {
        include: { permissions: true },
      },
    },
  });

  if (!user || !user.active) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileType: user.profile.type as ProfileType,
    profileLabel: user.profile.label,
    permissions: user.profile.permissions.map((p: { permission: string }) => p.permission as Permission),
    initials: makeInitials(user.name),
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new AuthError("Nao autenticado", 401);
  return user;
}

export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.permissions.includes(permission)) {
    throw new AuthError("Sem permissao", 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getClientIp(request: NextRequest): string | null {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || null;
}

export async function auditLog(
  userId: string,
  action: string,
  target: string,
  details?: Record<string, unknown> | null,
  ip?: string | null,
  topdeskRef?: string | null,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      target,
      details: details ? JSON.stringify(details) : null,
      ip: ip || null,
      topdeskRef: topdeskRef || null,
    },
  });
}
