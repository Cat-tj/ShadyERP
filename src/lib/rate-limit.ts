import { headers } from "next/headers";

/**
 * Rate limiter in-memory sederhana (fixed window per key). CUKUP untuk
 * deployment single-instance (mis. satu VPS/container) — TIDAK efektif kalau
 * di-deploy multi-instance/serverless (state tidak dibagi antar instance).
 * Kalau nanti scale ke banyak instance, ganti implementasi ini dengan
 * penyimpanan bersama (mis. Redis) tanpa mengubah pemanggilnya.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 20_000;

export type RateLimitResult = { allowed: boolean; retryAfterMs: number };

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** IP klien dari header proxy — dipakai sebagai kunci rate limit di Server Action. */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

export function formatRetryMessage(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000);
  return `Terlalu banyak percobaan. Coba lagi dalam ${seconds} detik.`;
}
