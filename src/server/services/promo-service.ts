import { prisma } from "@/lib/prisma";
import type { PromoDiscountType, PromoScope } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export type PromoInput = {
  name: string;
  discountType: PromoDiscountType;
  discountValue: number;
  scope: PromoScope;
  categoryId: string | null;
  minSpend: number;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export async function listPromos(tenantId: string) {
  return prisma.promo.findMany({
    where: { tenantId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPromo(tenantId: string, input: PromoInput) {
  return prisma.promo.create({ data: { tenantId, ...input } });
}

export async function updatePromo(tenantId: string, id: string, input: PromoInput) {
  const promo = await prisma.promo.findFirst({ where: { id, tenantId } });
  if (!promo) throw new Error("Promo tidak ditemukan.");
  return prisma.promo.update({ where: { id }, data: input });
}

export async function deletePromo(tenantId: string, id: string) {
  const promo = await prisma.promo.findFirst({ where: { id, tenantId } });
  if (!promo) throw new Error("Promo tidak ditemukan.");
  return prisma.promo.delete({ where: { id } });
}

/** Format "HH:mm" jadi menit sejak tengah malam supaya gampang dibandingkan. */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Promo yang jadwalnya cocok dengan waktu SEKARANG (hari & jam server) —
 * dipanggil saat halaman Kasir dibuka supaya diskon otomatis aktif tanpa
 * kasir perlu input manual. Mendukung jendela waktu yang melewati tengah
 * malam (mis. 22:00–02:00).
 */
export async function getActivePromosNow(tenantId: string) {
  const promos = await prisma.promo.findMany({
    where: { tenantId, isActive: true },
    include: { category: true },
  });

  const now = new Date();
  const dayOfWeek = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return promos.filter((promo) => {
    if (promo.daysOfWeek.length > 0 && !promo.daysOfWeek.includes(dayOfWeek)) {
      return false;
    }
    const start = timeToMinutes(promo.startTime);
    const end = timeToMinutes(promo.endTime);
    if (start <= end) {
      return nowMinutes >= start && nowMinutes <= end;
    }
    // Jendela waktu melewati tengah malam, mis. 22:00–02:00.
    return nowMinutes >= start || nowMinutes <= end;
  });
}

export type ActivePromo = Awaited<ReturnType<typeof getActivePromosNow>>[number];

export { computeBestPromoDiscount, type PromoCartLine } from "@/lib/promo";
