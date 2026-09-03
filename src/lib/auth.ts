import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AdminRole } from "@/models/types";

/**
 * Admin sessions: a short-lived access token plus a long-lived refresh token,
 * both in httpOnly cookies. Nothing sensitive is ever readable from JavaScript.
 */
export const ACCESS_COOKIE = "kani_at";
export const REFRESH_COOKIE = "kani_rt";

const ACCESS_TTL_SECONDS = 60 * 30; // 30 minutes
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

function secret(which: "access" | "refresh"): Uint8Array {
  const raw =
    which === "access"
      ? process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(raw);
}

async function sign(
  payload: Record<string, unknown>,
  which: "access" | "refresh",
  ttl: number
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("kani.lk")
    .setExpirationTime(`${ttl}s`)
    .sign(secret(which));
}

export async function createSession(user: SessionUser) {
  const [accessToken, refreshToken] = await Promise.all([
    sign({ ...user, typ: "access" }, "access", ACCESS_TTL_SECONDS),
    sign({ id: user.id, typ: "refresh" }, "refresh", REFRESH_TTL_SECONDS),
  ]);

  const store = await cookies();
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  store.set(ACCESS_COOKIE, accessToken, { ...base, maxAge: ACCESS_TTL_SECONDS });
  store.set(REFRESH_COOKIE, refreshToken, { ...base, maxAge: REFRESH_TTL_SECONDS });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

/** Verify a token. Used by both the server helpers and the edge middleware. */
export async function verifyAccessToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret("access"), {
      issuer: "kani.lk",
    });
    if (payload.typ !== "access") return null;
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as AdminRole,
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret("refresh"), {
      issuer: "kani.lk",
    });
    if (payload.typ !== "refresh") return null;
    return String(payload.id);
  } catch {
    return null;
  }
}

/** The current admin, or null. Safe to call from any server component. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

/**
 * Guard for server actions and route handlers. Throws rather than returning
 * null, so a forgotten check fails loudly instead of silently allowing a write.
 */
export async function requireSession(role?: AdminRole): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new AuthError("Not signed in");
  if (role === "superadmin" && user.role !== "superadmin") {
    throw new AuthError("This action needs a superadmin account");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
