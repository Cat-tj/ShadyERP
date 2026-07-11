import { prisma } from "@/lib/prisma";
import { daysAgoRangeJakarta } from "@/lib/date-range";
import type { StockAdjustmentReason } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export const WASTE_REASON_LABEL: Record<StockAdjustmentReason, string> = {
  WASTE: "Waste/Terbuang",
  EXPIRED: "Kadaluarsa",
  DAMAGED: "Rusak",
  OTHER: "Lainnya",
};

export async function recordWaste(input: {
  tenantId: string;
  productId: string;
  outletId: string;
  qty: number;
  reason: StockAdjustmentReason;
  note?: string;
  changedById: string;
}) {
  if (!Number.isFinite(input.qty) || input.qty <= 0) {
    throw new Error("Jumlah kerugian harus lebih dari 0.");
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({ where: { id: input.productId, tenantId: input.tenantId } });
    if (!product) throw new Error("Produk tidak ditemukan.");

    const stock = await tx.productStock.findUnique({
      where: { productId_outletId: { productId: input.productId, outletId: input.outletId } },
    });
    const previousQty = stock?.qty ?? 0;
    if (input.qty > previousQty) {
      throw new Error(`Stok ${product.name} cuma ${previousQty} — tidak bisa catat kerugian ${input.qty}.`);
    }
    const newQty = previousQty - input.qty;

    await tx.productStock.upsert({
      where: { productId_outletId: { productId: input.productId, outletId: input.outletId } },
      update: { qty: newQty },
      create: { tenantId: input.tenantId, productId: input.productId, outletId: input.outletId, qty: newQty },
    });

    return tx.stockAdjustment.create({
      data: {
        tenantId: input.tenantId,
        productId: input.productId,
        outletId: input.outletId,
        changedById: input.changedById,
        previousQty,
        newQty,
        delta: -input.qty,
        reason: input.reason,
        note: input.note?.trim() || null,
      },
    });
  });
}

export async function listRecentWaste(tenantId: string, outletIds: string[], take = 20) {
  return prisma.stockAdjustment.findMany({
    where: { tenantId, outletId: { in: outletIds }, reason: { not: null } },
    include: {
      product: { select: { name: true } },
      outlet: { select: { name: true } },
      changedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export type WasteSummary = {
  totalLossQty: number;
  totalLossValue: number;
  byReason: { reason: StockAdjustmentReason; qty: number; value: number }[];
  topProducts: { productId: string; productName: string; qty: number; value: number }[];
};

export async function getWasteSummary(tenantId: string, outletIds: string[], days: number): Promise<WasteSummary> {
  const { start, end } = daysAgoRangeJakarta(days);

  const adjustments = await prisma.stockAdjustment.findMany({
    where: { tenantId, outletId: { in: outletIds }, reason: { not: null }, createdAt: { gte: start, lt: end } },
    include: { product: { select: { id: true, name: true, cost: true } } },
  });

  let totalLossQty = 0;
  let totalLossValue = 0;
  const byReasonMap = new Map<StockAdjustmentReason, { qty: number; value: number }>();
  const byProductMap = new Map<string, { productName: string; qty: number; value: number }>();

  for (const adj of adjustments) {
    const qty = Math.abs(adj.delta);
    const value = qty * (adj.product.cost ?? 0);
    totalLossQty += qty;
    totalLossValue += value;

    const reasonKey = adj.reason ?? "OTHER";
    const r = byReasonMap.get(reasonKey) ?? { qty: 0, value: 0 };
    r.qty += qty;
    r.value += value;
    byReasonMap.set(reasonKey, r);

    const p = byProductMap.get(adj.productId) ?? { productName: adj.product.name, qty: 0, value: 0 };
    p.qty += qty;
    p.value += value;
    byProductMap.set(adj.productId, p);
  }

  return {
    totalLossQty,
    totalLossValue,
    byReason: Array.from(byReasonMap.entries()).map(([reason, v]) => ({ reason, ...v })),
    topProducts: Array.from(byProductMap.entries())
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
  };
}
