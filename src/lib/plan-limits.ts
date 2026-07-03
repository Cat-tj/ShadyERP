import type { Plan } from "@prisma/client";

/**
 * Batasan & harga per paket. Angka di sini adalah default yang masuk akal —
 * gampang diubah di satu tempat ini kalau strategi harga berubah.
 */
export const PLAN_LIMITS: Record<
  Plan,
  { label: string; maxOutlets: number; maxUsers: number; maxProducts: number; priceMonthly: number }
> = {
  FREE: { label: "Free", maxOutlets: 1, maxUsers: 3, maxProducts: 50, priceMonthly: 0 },
  BASIC: { label: "Basic", maxOutlets: 3, maxUsers: 10, maxProducts: 500, priceMonthly: 99_000 },
  PRO: { label: "Pro", maxOutlets: Infinity, maxUsers: Infinity, maxProducts: Infinity, priceMonthly: 249_000 },
};

export const PLAN_ORDER: Plan[] = ["FREE", "BASIC", "PRO"];

export function formatLimit(value: number): string {
  return value === Infinity ? "Tanpa batas" : String(value);
}
