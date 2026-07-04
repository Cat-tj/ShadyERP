import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays } from "@/lib/date-range";

/**
 * KPI & Advanced Analytics service
 * Metrics: sales velocity, stock turnover, member retention, revenue by category
 */

// ============ SALES VELOCITY ============

/** Omzet per jam untuk hari ini (untuk identifikasi peak hours) */
export async function getSalesVelocityByHour(tenantId: string, outletId?: string) {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      ...(outletId && { outletId }),
      createdAt: { gte: today, lte: tomorrow },
      status: "COMPLETED",
    },
    select: { createdAt: true, total: true },
  });

  // Group by hour
  const hourlyData: Record<number, { hour: number; sales: number; count: number }> = {};
  for (let h = 0; h < 24; h++) {
    hourlyData[h] = { hour: h, sales: 0, count: 0 };
  }

  sales.forEach((sale) => {
    const hour = new Date(sale.createdAt).getHours();
    hourlyData[hour].sales += sale.total;
    hourlyData[hour].count += 1;
  });

  return Object.values(hourlyData);
}

// ============ STOCK TURNOVER RATE ============

/** Stock turnover = COGS / Average Inventory. Menunjukkan seberapa cepat stok bergerak */
export async function getStockTurnoverByProduct(
  tenantId: string,
  outletId: string,
  period = 30 // hari
) {
  const startDate = subDays(new Date(), period);
  const endDate = new Date();

  const sales = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: { tenantId, outletId, status: "COMPLETED", createdAt: { gte: startDate, lte: endDate } },
    },
    _sum: { qty: true, subtotal: true },
  });

  const turnoverData = await Promise.all(
    sales.map(async (sale) => {
      const product = await prisma.product.findUnique({
        where: { id: sale.productId },
        include: { stocks: { where: { outletId } } },
      });

      const totalQtySold = sale._sum.qty ?? 0;
      const currentStock = product?.stocks[0]?.qty ?? 0;
      const avgStock = (currentStock + totalQtySold) / 2 || 1; // Avoid division by zero
      const turnoverRate = Math.round((totalQtySold / avgStock) * 100) / 100;

      return {
        productId: sale.productId,
        productName: product?.name,
        qtySold: totalQtySold,
        currentStock,
        turnoverRate,
        revenue: sale._sum.subtotal ?? 0,
      };
    })
  );

  return turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate);
}

// ============ MEMBER RETENTION ============

/** Member yang beli dalam N hari terakhir (active members) vs total members */
export async function getMemberRetentionRate(tenantId: string, daysThreshold = 30) {
  const cutoffDate = subDays(new Date(), daysThreshold);

  const [totalMembers, activeMembers] = await Promise.all([
    prisma.member.count({ where: { tenantId } }),
    prisma.pointTransaction
      .groupBy({
        by: ["memberId"],
        where: {
          tenantId,
          createdAt: { gte: cutoffDate },
        },
      })
      .then((result) => result.length),
  ]);

  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  return {
    totalMembers,
    activeMembers,
    retentionRate,
    period: `${daysThreshold} hari terakhir`,
  };
}

// ============ REVENUE BY CATEGORY ============

/** Breakdown revenue by kategori produk dalam periode */
export async function getRevenueByCategory(tenantId: string, outletId?: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const revenue = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: {
        tenantId,
        ...(outletId && { outletId }),
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
    },
    _sum: { subtotal: true, qty: true },
  });

  const categoryData = await Promise.all(
    revenue.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });
      return {
        categoryId: product?.categoryId,
        categoryName: product?.category?.name ?? "Tanpa Kategori",
        revenue: item._sum.subtotal ?? 0,
        qtySold: item._sum.qty ?? 0,
      };
    })
  );

  const grouped = categoryData.reduce(
    (acc, item) => {
      const existing = acc.find((c) => c.categoryId === item.categoryId);
      if (existing) {
        existing.revenue += item.revenue;
        existing.qtySold += item.qtySold;
      } else {
        acc.push(item);
      }
      return acc;
    },
    [] as typeof categoryData
  );

  return grouped.sort((a, b) => b.revenue - a.revenue);
}

// ============ TOP PRODUCTS ============

export async function getTopProductsByRevenue(
  tenantId: string,
  outletId?: string,
  limit = 10,
  period = 30
) {
  const startDate = subDays(new Date(), period);

  const topProducts = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: {
        tenantId,
        ...(outletId && { outletId }),
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
    },
    _sum: { subtotal: true, qty: true },
    orderBy: { _sum: { subtotal: "desc" } },
    take: limit,
  });

  return Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      return {
        productId: item.productId,
        productName: product?.name,
        revenue: item._sum.subtotal ?? 0,
        qtySold: item._sum.qty ?? 0,
        avgPrice: item._sum.qty ? Math.round((item._sum.subtotal ?? 0) / item._sum.qty) : 0,
      };
    })
  );
}

// ============ OUTLET COMPARISON ============

export async function getOutletComparison(tenantId: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const outlets = await prisma.outlet.findMany({
    where: { tenantId, isActive: true },
  });

  return Promise.all(
    outlets.map(async (outlet) => {
      const [totalSales, saleCount, totalItems] = await Promise.all([
        prisma.sale.aggregate({
          where: {
            tenantId,
            outletId: outlet.id,
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _sum: { total: true },
        }),
        prisma.sale.count({
          where: {
            tenantId,
            outletId: outlet.id,
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
        }),
        prisma.saleItem.aggregate({
          where: {
            sale: {
              tenantId,
              outletId: outlet.id,
              status: "COMPLETED",
              createdAt: { gte: startDate },
            },
          },
          _sum: { qty: true },
        }),
      ]);

      return {
        outletId: outlet.id,
        outletName: outlet.name,
        revenue: totalSales._sum.total ?? 0,
        transactionCount: saleCount,
        itemsSold: totalItems._sum.qty ?? 0,
        avgTransaction: saleCount > 0 ? Math.round((totalSales._sum.total ?? 0) / saleCount) : 0,
      };
    })
  );
}
