import type { PromoDiscountType, PromoScope } from "@prisma/client";

/**
 * Logika murni (tanpa akses database) supaya bisa dipakai di client
 * component (pos-screen) maupun server (promo-service) tanpa menyeret
 * import Prisma Client ke bundle browser.
 */

export type PromoForCalc = {
  id: string;
  name: string;
  discountType: PromoDiscountType;
  discountValue: number;
  scope: PromoScope;
  categoryId: string | null;
  minSpend: number;
};

export type PromoCartLine = { productId: string; categoryId: string | null; lineTotal: number };

/**
 * Menghitung diskon terbesar dari daftar promo yang sedang aktif untuk isi
 * keranjang saat ini. Hanya promo dengan syarat minimal belanja terpenuhi
 * yang dipertimbangkan; promo dengan diskon terbesar yang dipakai (tidak
 * ditumpuk/stack).
 */
export function computeBestPromoDiscount(
  promos: PromoForCalc[],
  cart: PromoCartLine[],
  subtotal: number
): { promoId: string; promoName: string; discountAmount: number } | null {
  let best: { promoId: string; promoName: string; discountAmount: number } | null = null;

  for (const promo of promos) {
    if (subtotal < promo.minSpend) continue;

    const base =
      promo.scope === "CATEGORY"
        ? cart
            .filter((line) => line.categoryId === promo.categoryId)
            .reduce((sum, line) => sum + line.lineTotal, 0)
        : subtotal;
    if (base <= 0) continue;

    const discountAmount =
      promo.discountType === "PERCENT"
        ? Math.round((base * promo.discountValue) / 100)
        : Math.min(promo.discountValue, base);

    if (discountAmount > 0 && (!best || discountAmount > best.discountAmount)) {
      best = { promoId: promo.id, promoName: promo.name, discountAmount };
    }
  }

  return best;
}
