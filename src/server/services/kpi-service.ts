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
        outletType: outlet.outletType,
        revenue: totalSales._sum.total ?? 0,
        transactionCount: saleCount,
        itemsSold: totalItems._sum.qty ?? 0,
        avgTransaction: saleCount > 0 ? Math.round((totalSales._sum.total ?? 0) / saleCount) : 0,
      };
    })
  );
}

/** Omzet digabung per jenis outlet (Cabang tetap / Pop-up / Event) — buat bandingin kontribusi tiap jenis cabang. */
export async function getRevenueByOutletType(tenantId: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const [outlets, salesByOutlet] = await Promise.all([
    prisma.outlet.findMany({ where: { tenantId, isActive: true } }),
    prisma.sale.groupBy({
      by: ["outletId"],
      where: { tenantId, status: "COMPLETED", createdAt: { gte: startDate } },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  const statsByOutletId = new Map(
    salesByOutlet.map((s) => [s.outletId, { revenue: s._sum.total ?? 0, transactionCount: s._count }])
  );

  const byType = new Map<string, { revenue: number; transactionCount: number; outletCount: number }>();
  for (const outlet of outlets) {
    const stats = statsByOutletId.get(outlet.id) ?? { revenue: 0, transactionCount: 0 };
    const existing = byType.get(outlet.outletType) ?? { revenue: 0, transactionCount: 0, outletCount: 0 };
    existing.revenue += stats.revenue;
    existing.transactionCount += stats.transactionCount;
    existing.outletCount += 1;
    byType.set(outlet.outletType, existing);
  }

  return Array.from(byType.entries())
    .map(([outletType, v]) => ({ outletType: outletType as "PERMANENT" | "POPUP" | "EVENT", ...v }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ============ SPLIT PAYMENT USAGE ============

/** Seberapa sering split payment dipakai, dan rincian per metode (dari SalePayment). */
export async function getSplitPaymentUsage(tenantId: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const [splitSaleCount, totalSaleCount, methodBreakdown] = await Promise.all([
    prisma.sale.count({
      where: { tenantId, status: "COMPLETED", isSplitPayment: true, createdAt: { gte: startDate } },
    }),
    prisma.sale.count({
      where: { tenantId, status: "COMPLETED", createdAt: { gte: startDate } },
    }),
    prisma.salePayment.groupBy({
      by: ["method"],
      where: { tenantId, sale: { status: "COMPLETED", createdAt: { gte: startDate } } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    splitSaleCount,
    totalSaleCount,
    splitRatePercent: totalSaleCount > 0 ? Math.round((splitSaleCount / totalSaleCount) * 100) : 0,
    methodBreakdown: methodBreakdown
      .map((m) => ({ method: m.method, amount: m._sum.amount ?? 0, count: m._count }))
      .sort((a, b) => b.amount - a.amount),
  };
}

// ============ ATRIBUSI MENU FAVORIT MEMBER (E11) ============

/** Kontribusi omzet dari baris keranjang yang ditambahkan lewat chip "menu favorit member" (D6) di kasir. */
export async function getFavoriteAttributionStats(tenantId: string, period = 30) {
  const startDate = subDays(new Date(), period);

  const [favoriteItems, totalRevenueResult] = await Promise.all([
    prisma.saleItem.findMany({
      where: {
        tenantId,
        isFavoritePick: true,
        sale: { status: "COMPLETED", createdAt: { gte: startDate } },
      },
      select: { productId: true, productName: true, subtotal: true, qty: true },
    }),
    prisma.saleItem.aggregate({
      where: { tenantId, sale: { status: "COMPLETED", createdAt: { gte: startDate } } },
      _sum: { subtotal: true },
    }),
  ]);

  const favoriteRevenue = favoriteItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalRevenue = totalRevenueResult._sum.subtotal ?? 0;

  const byProduct = new Map<string, { productName: string; revenue: number; qty: number }>();
  for (const item of favoriteItems) {
    const existing = byProduct.get(item.productId) ?? { productName: item.productName, revenue: 0, qty: 0 };
    existing.revenue += item.subtotal;
    existing.qty += item.qty;
    byProduct.set(item.productId, existing);
  }

  return {
    favoriteRevenue,
    totalRevenue,
    contributionPercent: totalRevenue > 0 ? Math.round((favoriteRevenue / totalRevenue) * 100) : 0,
    itemCount: favoriteItems.length,
    topProducts: Array.from(byProduct.entries())
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
  };
}
