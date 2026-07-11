import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Inventory management service dengan fitur:
 * - Stock reorder points (minimal stok per produk per outlet)
 * - Stock batch/lot tracking (untuk FMCG/makanan/farmasi)
 * - Warehouse location tracking
 */

// ============ STOCK REORDER POINT ============

export async function setReorderPoint(
  tenantId: string,
  productId: string,
  outletId: string,
  minQty: number
) {
  return prisma.stockReorderPoint.upsert({
    where: { productId_outletId: { productId, outletId } },
    update: { minQty },
    create: { tenantId, productId, outletId, minQty },
  });
}

export async function getReorderPoint(productId: string, outletId: string) {
  return prisma.stockReorderPoint.findUnique({
    where: { productId_outletId: { productId, outletId } },
  });
}

/** Dapatkan semua produk yang stoknya di bawah reorder point di outlet tertentu */
export async function getLowStockProducts(tenantId: string, outletId: string) {
  const lowStockItems = await prisma.stockReorderPoint.findMany({
    where: { tenantId, outletId },
    include: {
      product: {
        include: {
          stocks: {
            where: { outletId },
          },
        },
      },
    },
  });

  return lowStockItems
    .filter((item) => {
      const currentStock = item.product.stocks[0]?.qty ?? 0;
      return currentStock <= item.minQty;
    })
    .map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      currentStock: item.product.stocks[0]?.qty ?? 0,
      reorderPoint: item.minQty,
      deficit: item.minQty - (item.product.stocks[0]?.qty ?? 0),
    }));
}

// ============ STOCK BATCH / LOT TRACKING ============

export async function receiveBatch(
  tenantId: string,
  productId: string,
  outletId: string,
  batchNumber: string,
  qtyReceived: number,
  expirationDate?: Date,
  note?: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  return client.stockBatch.create({
    data: {
      tenantId,
      productId,
      outletId,
      batchNumber,
      qtyReceived,
      qtyRemaining: qtyReceived,
      expirationDate,
      note,
    },
  });
}

/** Konsumsi batch saat penjualan (FIFO strategy — gunakan batch tertua dulu) */
export async function consumeBatchFIFO(
  tenantId: string,
  productId: string,
  outletId: string,
  qty: number,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  const batches = await client.stockBatch.findMany({
    where: { tenantId, productId, outletId, qtyRemaining: { gt: 0 } },
    orderBy: { receivedDate: "asc" }, // FIFO — batch paling tua dulu
  });

  let remainingQty = qty;
  const consumed = [];

  for (const batch of batches) {
    if (remainingQty <= 0) break;

    const consumeQty = Math.min(batch.qtyRemaining, remainingQty);
    await client.stockBatch.update({
      where: { id: batch.id },
      data: { qtyRemaining: batch.qtyRemaining - consumeQty },
    });

    consumed.push({ batchId: batch.id, qtyConsumed: consumeQty });
    remainingQty -= consumeQty;
  }

  return { totalConsumed: qty - remainingQty, batches: consumed };
}

/** List batches yang sudah expired atau akan expired dalam N hari */
export async function getExpiringBatches(tenantId: string, outletId: string, daysThreshold = 7) {
  const now = new Date();
  const warningDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  return prisma.stockBatch.findMany({
    where: {
      tenantId,
      outletId,
      qtyRemaining: { gt: 0 },
      expirationDate: {
        lte: warningDate,
      },
    },
    include: { product: true },
    orderBy: { expirationDate: "asc" },
  });
}

export async function getBatchesForProduct(tenantId: string, productId: string, outletId: string) {
  return prisma.stockBatch.findMany({
    where: { tenantId, productId, outletId },
    orderBy: { receivedDate: "desc" },
  });
}

// ============ WAREHOUSE LOCATION ============

export async function createWarehouseLocation(
  tenantId: string,
  outletId: string,
  code: string,
  name: string,
  capacity?: number
) {
  return prisma.warehouseLocation.create({
    data: {
      tenantId,
      outletId,
      code,
      name,
      capacity,
    },
  });
}

export async function getWarehouseLocations(tenantId: string, outletId: string) {
  return prisma.warehouseLocation.findMany({
    where: { tenantId, outletId, isActive: true },
    orderBy: { code: "asc" },
  });
}

export async function updateWarehouseLocation(
  id: string,
  data: { name?: string; capacity?: number | null; isActive?: boolean }
) {
  return prisma.warehouseLocation.update({
    where: { id },
    data,
  });
}
