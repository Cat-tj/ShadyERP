import { prisma } from "@/lib/prisma";
import type { Prisma, StockMovement, StockMovementSourceType } from "@prisma/client";

/**
 * Ledger append-only untuk pergerakan stok produksi (Altora Pabrik). Ini
 * BUKAN pengganti ProductStock/StockAdjustment yang dipakai POS retail —
 * modul Pabrik menelusuri stok lewat tabel ini karena saldo harus bisa
 * dibangun ulang dari riwayat pergerakan (lihat docs/TODO-PABRIK-MANUFAKTUR.md).
 *
 * Semua fungsi di sini menerima `tx` opsional (Prisma.TransactionClient) supaya
 * bisa dipanggil dari dalam prisma.$transaction() milik service lain (mis.
 * work-order-service saat issue material dalam satu transaksi dengan
 * perubahan status WO) — default ke instance `prisma` global kalau dipanggil
 * berdiri sendiri.
 */

export interface RecordMovementInput {
  productId: string;
  qty: number;
  fromWarehouseId?: string | null;
  toWarehouseId?: string | null;
  sourceType: StockMovementSourceType;
  sourceId: string;
  actorId: string;
  idempotencyKey: string;
  note?: string;
}

type Client = Prisma.TransactionClient | typeof prisma;

/**
 * Bentuk idempotency key yang konsisten: sourceType + sourceId + suffix opsional
 * (mis. per baris BOM saat issue banyak bahan sekaligus dalam satu WO).
 */
export function buildIdempotencyKey(sourceType: StockMovementSourceType, sourceId: string, suffix?: string): string {
  return [sourceType, sourceId, suffix].filter(Boolean).join(":");
}

export async function recordMovement(
  tenantId: string,
  input: RecordMovementInput,
  tx: Client = prisma
): Promise<StockMovement> {
  if (input.qty <= 0) {
    throw new Error("Jumlah pergerakan stok harus lebih dari 0.");
  }
  if (!input.fromWarehouseId && !input.toWarehouseId) {
    throw new Error("Pergerakan stok harus punya gudang asal atau gudang tujuan.");
  }

  // Idempotency: kalau movement dengan key ini sudah pernah dicatat (mis. retry
  // offline sync atau tombol ke-tap dua kali), kembalikan yang sudah ada —
  // jangan insert dobel dan jangan lempar error ke pemanggil.
  const existing = await tx.stockMovement.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) {
    if (existing.tenantId !== tenantId) {
      throw new Error("Idempotency key ini sudah dipakai tenant lain — kemungkinan bug pemanggil.");
    }
    return existing;
  }

  return tx.stockMovement.create({
    data: {
      tenantId,
      productId: input.productId,
      qty: input.qty,
      fromWarehouseId: input.fromWarehouseId ?? null,
      toWarehouseId: input.toWarehouseId ?? null,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      actorId: input.actorId,
      idempotencyKey: input.idempotencyKey,
      note: input.note,
    },
  });
}

/** Saldo produk di satu gudang = total masuk - total keluar, dihitung ulang dari ledger. */
export async function getWarehouseBalance(tenantId: string, productId: string, warehouseId: string): Promise<number> {
  const [inSum, outSum] = await Promise.all([
    prisma.stockMovement.aggregate({
      where: { tenantId, productId, toWarehouseId: warehouseId },
      _sum: { qty: true },
    }),
    prisma.stockMovement.aggregate({
      where: { tenantId, productId, fromWarehouseId: warehouseId },
      _sum: { qty: true },
    }),
  ]);
  return (inSum._sum.qty ?? 0) - (outSum._sum.qty ?? 0);
}

export async function listMovementsBySource(
  tenantId: string,
  sourceType: StockMovementSourceType,
  sourceId: string
): Promise<StockMovement[]> {
  return prisma.stockMovement.findMany({
    where: { tenantId, sourceType, sourceId },
    orderBy: { createdAt: "asc" },
    include: { product: true, fromWarehouse: true, toWarehouse: true, actor: true },
  });
}

export async function listMovementsForProductWarehouse(
  tenantId: string,
  productId: string,
  warehouseId: string
): Promise<StockMovement[]> {
  return prisma.stockMovement.findMany({
    where: {
      tenantId,
      productId,
      OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
    },
    orderBy: { createdAt: "desc" },
  });
}
