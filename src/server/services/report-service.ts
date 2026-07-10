import { prisma } from "@/lib/prisma";
import { todayRangeJakarta } from "@/lib/date-range";
import { getExpenseSummary } from "@/server/services/expense-service";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

function rangeForDays(days: number) {
  const { end } = todayRangeJakarta();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function getSalesSummary(tenantId: string, outletIds: string[], days: number) {
  const { start, end } = rangeForDays(days);

  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      status: "COMPLETED",
      createdAt: { gte: start, lt: end },
    },
    select: { total: true, saleReturns: { select: { totalRefund: true } } },
  });

  const totalOmzet = sales.reduce(
    (sum, s) => sum + s.total - s.saleReturns.reduce((r, sr) => r + sr.totalRefund, 0),
    0
  );
  const totalTransaksi = sales.length;
  const rataRataTransaksi = totalTransaksi > 0 ? Math.round(totalOmzet / totalTransaksi) : 0;

  const items = await prisma.saleItem.findMany({
    where: {
      tenantId,
      sale: { outletId: { in: outletIds }, status: "COMPLETED", createdAt: { gte: start, lt: end } },
    },
    select: { qty: true, returnedQty: true, price: true, productId: true },
  });

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, cost: true },
  });
  const costMap = new Map(products.map((p) => [p.id, p.cost]));

  let estimasiUntung = 0;
  for (const item of items) {
    const cost = costMap.get(item.productId);
    const sellableQty = item.qty - item.returnedQty;
    if (cost != null && sellableQty > 0) {
      estimasiUntung += (item.price - cost) * sellableQty;
    }
  }

  const { totalExpense } = await getExpenseSummary(tenantId, outletIds, days);
  const untungBersih = estimasiUntung - totalExpense;

  return { totalOmzet, totalTransaksi, rataRataTransaksi, estimasiUntung, totalExpense, untungBersih };
}

export async function getDailyTrend(tenantId: string, outletIds: string[], days: number) {
  const { start, end } = rangeForDays(days);

  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      status: "COMPLETED",
      createdAt: { gte: start, lt: end },
    },
    select: { total: true, createdAt: true, saleReturns: { select: { totalRefund: true } } },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  for (const sale of sales) {
    const jakartaMs = sale.createdAt.getTime() + 7 * 60 * 60 * 1000;
    const key = new Date(jakartaMs).toISOString().slice(0, 10);
    const netTotal = sale.total - sale.saleReturns.reduce((r, sr) => r + sr.totalRefund, 0);
    buckets.set(key, (buckets.get(key) ?? 0) + netTotal);
  }

  return Array.from(buckets.entries()).map(([date, omzet]) => ({ date, omzet }));
}

export async function getTopProducts(tenantId: string, outletIds: string[], days: number, limit = 8) {
  const { start, end } = rangeForDays(days);

  const items = await prisma.saleItem.findMany({
    where: {
      tenantId,
      sale: { outletId: { in: outletIds }, status: "COMPLETED", createdAt: { gte: start, lt: end } },
    },
    select: { productName: true, qty: true, returnedQty: true, subtotal: true },
  });

  const map = new Map<string, { qty: number; omzet: number }>();
  for (const item of items) {
    const sellableQty = item.qty - item.returnedQty;
    if (sellableQty <= 0) continue;
    const netOmzet = Math.round((item.subtotal / item.qty) * sellableQty);
    const entry = map.get(item.productName) ?? { qty: 0, omzet: 0 };
    entry.qty += sellableQty;
    entry.omzet += netOmzet;
    map.set(item.productName, entry);
  }

  return Array.from(map.entries())
    .map(([productName, v]) => ({ productName, ...v }))
    .sort((a, b) => b.omzet - a.omzet)
    .slice(0, limit);
}

export async function getProductSalesPerformance(
  tenantId: string,
  outletIds: string[],
  days: number,
  limit = 8
) {
  const { start, end } = rangeForDays(days);

  const [products, items] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        trackStock: true,
        category: { select: { name: true } },
        stocks: {
          where: { outletId: { in: outletIds } },
          select: { qty: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.saleItem.findMany({
      where: {
        tenantId,
        sale: { outletId: { in: outletIds }, status: "COMPLETED", createdAt: { gte: start, lt: end } },
      },
      select: { productId: true, qty: true, returnedQty: true, subtotal: true },
    }),
  ]);

  const salesMap = new Map<string, { qty: number; omzet: number }>();
  for (const item of items) {
    const sellableQty = Math.max(0, item.qty - item.returnedQty);
    if (sellableQty <= 0) continue;

    const netOmzet = item.qty > 0 ? Math.round((item.subtotal / item.qty) * sellableQty) : 0;
    const entry = salesMap.get(item.productId) ?? { qty: 0, omzet: 0 };
    entry.qty += sellableQty;
    entry.omzet += netOmzet;
    salesMap.set(item.productId, entry);
  }

  const rows = products.map((product) => {
    const sales = salesMap.get(product.id) ?? { qty: 0, omzet: 0 };
    const stockQty = product.stocks.reduce((sum, stock) => sum + stock.qty, 0);
    return {
      productId: product.id,
      productName: product.name,
      categoryName: product.category?.name ?? "Tanpa kategori",
      qty: sales.qty,
      omzet: sales.omzet,
      stockQty,
      trackStock: product.trackStock,
      price: product.price,
    };
  });

  return {
    topSales: [...rows].sort((a, b) => b.qty - a.qty || b.omzet - a.omzet).slice(0, limit),
    worstSales: [...rows].sort((a, b) => a.qty - b.qty || a.omzet - b.omzet).slice(0, limit),
  };
}

export async function getOutletComparison(tenantId: string, outletIds: string[], days: number) {
  const { start, end } = rangeForDays(days);

  const outlets = await prisma.outlet.findMany({ where: { tenantId, id: { in: outletIds } } });
  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      status: "COMPLETED",
      createdAt: { gte: start, lt: end },
    },
    select: { outletId: true, total: true, saleReturns: { select: { totalRefund: true } } },
  });

  return outlets.map((outlet) => {
    const outletSales = sales.filter((s) => s.outletId === outlet.id);
    return {
      outletName: outlet.name,
      omzet: outletSales.reduce(
        (sum, s) => sum + s.total - s.saleReturns.reduce((r, sr) => r + sr.totalRefund, 0),
        0
      ),
      transaksi: outletSales.length,
    };
  });
}
