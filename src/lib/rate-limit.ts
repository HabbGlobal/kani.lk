import "server-only";
import { createHash } from "node:crypto";

/**
 * In-memory fixed-window rate limiter. Adequate for a single-instance VPS or a
 * warm serverless container, which is what this site runs on. If it ever scales
 * horizontally, swap the Map for Redis — the call sites do not change.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Bound the map so a flood of unique IPs cannot grow it without limit.
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
      if (buckets.size >= MAX_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);

  return {
    ok: existing.count <= limit,
    remaining,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Client IP from the proxy headers Vercel and Nginx set. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Hashed before storage — we never keep a raw visitor IP in the database. */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.JWT_SECRET ?? ""))
    .digest("hex")
    .slice(0, 32);
}
