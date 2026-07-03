import { createHmac, timingSafeEqual } from "crypto";

/**
 * Sesi super-admin SENGAJA terpisah total dari NextAuth (yang dipakai untuk
 * sesi User tenant) — supaya tidak mungkin ada kebocoran hak akses antara
 * "login sebagai staff tenant X" dan "login sebagai pemilik platform".
 * Implementasi sengaja minimal (cookie ditandatangani HMAC, bukan JWT
 * library) supaya gampang diaudit.
 */

const COOKIE_NAME = "altora_superadmin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam

function getSigningKey(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET belum diatur.");
  return `${secret}:superadmin`;
}

function sign(payload: string): string {
  return createHmac("sha256", getSigningKey()).update(payload).digest("base64url");
}

export function createSuperAdminSessionCookie(superAdminId: string): {
  name: string;
  value: string;
  maxAgeSeconds: number;
} {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${superAdminId}.${expiresAt}`;
  const signature = sign(payload);
  return {
    name: COOKIE_NAME,
    value: `${payload}.${signature}`,
    maxAgeSeconds: SESSION_TTL_MS / 1000,
  };
}

export function verifySuperAdminSessionCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 3) return null;
  const [superAdminId, expiresAtStr, signature] = parts;
  const payload = `${superAdminId}.${expiresAtStr}`;
  const expected = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return superAdminId;
}

export const SUPER_ADMIN_COOKIE_NAME = COOKIE_NAME;
