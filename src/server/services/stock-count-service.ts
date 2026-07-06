import { prisma } from "@/lib/prisma";
import type { StockCount, StockCountStatus } from "@prisma/client";

export async function generateCountNumber(tenantId: string): Promise<string> {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const count = await prisma.stockCount.count({
    where: { tenantId },
  });
  return `SC-${today}-${String(count + 1).padStart(3, "0")}`;
}

export async function createStockCount(
  tenantId: string,
  outletId: string,
  countDate: Date,
  startedById: string
): Promise<StockCount> {
  const countNumber = await generateCountNumber(tenantId);

  // Get all products with current stock at this outlet
  const stocks = await prisma.productStock.findMany({
    where: { tenantId, outletId },
    include: { product: true },
  });

  return prisma.stockCount.create({
    data: {
      tenantId,
      outletId,
      countDate,
      countNumber,
      status: "DRAFT",
      startedBy: startedById,
      items: {
        create: stocks.map((stock) => ({
          productId: stock.productId,
          systemQty: stock.qty,
          physicalQty: 0, // To be filled during count
        })),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  });
}

export async function getCountById(tenantId: string, countId: string) {
  return prisma.stockCount.findFirst({
    where: { id: countId, tenantId },
    include: {
      outlet: true,
      items: { include: { product: true } },
      startedByUser: { select: { id: true, name: true } },
      completedByUser: { select: { id: true, name: true } },
      verifiedByUser: { select: { id: true, name: true } },
    },
  });
}

export async function getStockCounts(tenantId: string, outletId?: string, status?: StockCountStatus) {
  return prisma.stockCount.findMany({
    where: {
      tenantId,
      ...(outletId && { outletId }),
      ...(status && { status }),
    },
    include: {
      outlet: true,
      items: { include: { product: true } },
    },
    orderBy: { countDate: "desc" },
  });
}

export interface CountItemInput {
  stockCountItemId: string;
  physicalQty: number;
  notes?: string;
}

export async function updateCountItems(
  tenantId: string,
  countId: string,
  items: CountItemInput[]
): Promise<StockCount> {
  const count = await getCountById(tenantId, countId);
  if (!count) throw new Error("Stock count not found");

  // Update physical quantities
  for (const item of items) {
    const countItem = count.items.find((ci) => ci.id === item.stockCountItemId);
    if (!countItem) throw new Error("Count item not found");

    const variance = item.physicalQty - countItem.systemQty;
    const varianceValue = variance * (countItem.product.price || 0);

    await prisma.stockCountItem.update({
      where: { id: item.stockCountItemId },
      data: {
        physicalQty: item.physicalQty,
        variance,
        varianceValue,
        notes: item.notes,
      },
    });
  }

  return getCountById(tenantId, countId) as Promise<StockCount>;
}

export async function completeCount(
  tenantId: string,
  countId: string,
  completedById: string
): Promise<StockCount> {
  const count = await getCountById(tenantId, countId);
  if (!count) throw new Error("Stock count not found");

  // Calculate total variance value
  const totalVariance = count.items.reduce((sum, item) => sum + (item.varianceValue || 0), 0);

  return prisma.stockCount.update({
    where: { id: countId },
    data: {
      status: "COMPLETED",
      completedBy: completedById,
      totalVariance,
    },
  });
}

export async function verifyAndApplyCount(
  tenantId: string,
  countId: string,
  verifiedById: string
): Promise<StockCount> {
  const count = await getCountById(tenantId, countId);
  if (!count) throw new Error("Stock count not found");
  if (count.status !== "COMPLETED") throw new Error("Count must be completed before verification");

  // Apply all variances to actual stock
  for (const item of count.items) {
    if (item.variance !== 0) {
      const stock = await prisma.productStock.findUnique({
        where: {
          productId_outletId: {
            productId: item.productId,
            outletId: count.outletId,
          },
        },
      });

      if (stock) {
        await prisma.productStock.update({
          where: { id: stock.id },
          data: {
            qty: item.physicalQty,
          },
        });
      } else {
        await prisma.productStock.create({
          data: {
            tenantId,
            productId: item.productId,
            outletId: count.outletId,
            qty: item.physicalQty,
          },
        });
      }

      // Record adjustment in StockAdjustment
      await prisma.stockAdjustment.create({
        data: {
          tenantId,
          productId: item.productId,
          outletId: count.outletId,
          changedById: verifiedById,
          previousQty: item.systemQty,
          newQty: item.physicalQty,
          delta: item.variance,
          note: `Stock count adjustment (SC: ${count.countNumber})`,
        },
      });
    }
  }

  return prisma.stockCount.update({
    where: { id: countId },
    data: {
      status: "VERIFIED",
      verifiedBy: verifiedById,
    },
  });
}

export async function getCountStats(tenantId: string) {
  const counts = await prisma.stockCount.groupBy({
    by: ["status"],
    where: { tenantId },
    _count: { id: true },
  });

  const totalVariance = await prisma.stockCount.aggregate({
    where: { tenantId },
    _sum: { totalVariance: true },
  });

  return {
    byStatus: counts,
    totalVariance: totalVariance._sum.totalVariance || 0,
  };
}
