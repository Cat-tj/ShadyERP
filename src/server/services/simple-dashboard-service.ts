import { prisma } from "@/lib/prisma";
import { todayRangeJakarta } from "@/lib/date-range";
import { getCashOutletSummary } from "@/server/services/finance-operational-service";
import { getExpiringBatches, getLowStockProducts } from "@/server/services/inventory-service";
import { getTopProducts, getProductSalesPerformance } from "@/server/services/report-service";

export type SimpleAlertSeverity = "CRITICAL" | "WARNING" | "INFO";

export type SimpleAlert = {
  id: string;
  severity: SimpleAlertSeverity;
  category: "STOCK" | "EXPIRED" | "SHIFT" | "CASH" | "DEBT" | "SALES" | "ORDER" | "OFFLINE";
  title: string;
  body: string;
  href: string;
};

export async function getSimpleTodaySummary(tenantId: string, outletIds: string[]) {
  const { start, end } = todayRangeJakarta();
  const yesterdayStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);

  const [todaySales, yesterdaySales, cashOutlets, topProducts, alerts] = await Promise.all([
    getNetSales(tenantId, outletIds, start, end),
    getNetSales(tenantId, outletIds, yesterdayStart, start),
    getCashOutletSummary(tenantId, outletIds, 1),
    getTopProducts(tenantId, outletIds, 1, 3),
    getSimpleAlerts(tenantId, outletIds),
  ]);

  const cash = cashOutlets.reduce(
    (sum, outlet) => ({
      cashSales: sum.cashSales + outlet.cashSales,
      estimatedCash: sum.estimatedCash + outlet.estimatedCash,
      digitalSales: sum.digitalSales + Math.max(0, outlet.estimatedCash - outlet.cashSales),
      openShiftCount: sum.openShiftCount + outlet.openShiftCount,
    }),
    { cashSales: 0, estimatedCash: 0, digitalSales: 0, openShiftCount: 0 }
  );

  const digitalSales = await getDigitalSales(tenantId, outletIds, start, end);

  return {
    todaySales,
    yesterdaySales,
    delta: todaySales - yesterdaySales,
    cashSales: cash.cashSales,
    estimatedCash: cash.estimatedCash,
    digitalSales,
    openShiftCount: cash.openShiftCount,
    topProducts,
    alerts,
  };
}

export async function getSimpleAlerts(tenantId: string, outletIds: string[]): Promise<SimpleAlert[]> {
  const alerts: SimpleAlert[] = [];
  const firstOutletId = outletIds[0];
  if (!firstOutletId) return alerts;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    lowStockByOutlet,
    expiringByOutlet,
    openShifts,
    cashDiscrepancies,
    dueInvoices,
    pendingOrders,
    productPerformance,
  ] = await Promise.all([
    Promise.all(outletIds.map((outletId) => getLowStockProducts(tenantId, outletId))),
    Promise.all(outletIds.map((outletId) => getExpiringBatches(tenantId, outletId, 14))),
    prisma.cashierShift.findMany({
      where: { tenantId, outletId: { in: outletIds }, status: "OPEN" },
      include: { outlet: { select: { name: true } }, user: { select: { name: true } } },
      orderBy: { openedAt: "asc" },
      take: 8,
    }),
    prisma.cashierShift.findMany({
      where: {
        tenantId,
        outletId: { in: outletIds },
        status: "CLOSED",
        closedAt: { gte: lastWeek },
        closingCash: { not: null },
        expectedCash: { not: null },
      },
      include: { outlet: { select: { name: true } } },
      orderBy: { closedAt: "desc" },
      take: 8,
    }),
    prisma.supplierInvoice.findMany({
      where: {
        tenantId,
        status: { in: ["UNPAID", "PARTIAL"] },
        dueDate: { lte: nextWeek },
      },
      include: { supplier: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.tableOrder.findMany({
      where: { tenantId, outletId: { in: outletIds }, status: { in: ["PENDING", "ACCEPTED", "READY"] } },
      include: { table: { select: { name: true } }, outlet: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 8,
    }),
    getProductSalesPerformance(tenantId, outletIds, 30, 5),
  ]);

  lowStockByOutlet.flat().slice(0, 8).forEach((item) => {
    alerts.push({
      id: `stock-${item.productId}`,
      severity: item.currentStock <= 0 ? "CRITICAL" : "WARNING",
      category: "STOCK",
      title: `${item.productName} stok menipis`,
      body: `Sisa ${item.currentStock}, minimum ${item.reorderPoint}.`,
      href: "/inventory",
    });
  });

  expiringByOutlet.flat().slice(0, 8).forEach((batch) => {
    alerts.push({
      id: `expired-${batch.id}`,
      severity: "WARNING",
      category: "EXPIRED",
      title: `${batch.product.name} hampir expired`,
      body: batch.expirationDate
        ? `Batch ${batch.batchNumber} expired ${batch.expirationDate.toLocaleDateString("id-ID")}.`
        : `Batch ${batch.batchNumber} perlu dicek.`,
      href: "/inventory",
    });
  });

  openShifts.forEach((shift) => {
    alerts.push({
      id: `shift-${shift.id}`,
      severity: "WARNING",
      category: "SHIFT",
      title: `Shift ${shift.user.name} belum ditutup`,
      body: `${shift.outlet.name}, dibuka sejak ${shift.openedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`,
      href: "/kasir/tutup",
    });
  });

  cashDiscrepancies
    .filter((shift) => Math.abs((shift.closingCash ?? 0) - (shift.expectedCash ?? 0)) > 0)
    .forEach((shift) => {
      const delta = (shift.closingCash ?? 0) - (shift.expectedCash ?? 0);
      alerts.push({
        id: `cash-${shift.id}`,
        severity: Math.abs(delta) >= 50000 ? "CRITICAL" : "WARNING",
        category: "CASH",
        title: `Selisih kas ${shift.outlet.name}`,
        body: `Selisih tutup shift Rp${Math.abs(delta).toLocaleString("id-ID")}.`,
        href: "/finance/kas",
      });
    });

  dueInvoices.forEach((invoice) => {
    alerts.push({
      id: `debt-${invoice.id}`,
      severity: invoice.dueDate && invoice.dueDate < now ? "CRITICAL" : "WARNING",
      category: "DEBT",
      title: `Hutang ${invoice.supplier.name} jatuh tempo`,
      body: `${invoice.invoiceNumber}: sisa Rp${Math.max(0, invoice.total - invoice.paidAmount).toLocaleString("id-ID")}.`,
      href: "/finance/hutang-supplier",
    });
  });

  productPerformance.worstSales
    .filter((product) => product.trackStock && product.stockQty > 0 && product.qty === 0)
    .slice(0, 5)
    .forEach((product) => {
      alerts.push({
        id: `slow-${product.productId}`,
        severity: "INFO",
        category: "SALES",
        title: `${product.productName} belum bergerak`,
        body: `Stok ${product.stockQty}, belum terjual dalam 30 hari.`,
        href: "/simple/data",
      });
    });

  pendingOrders.forEach((order) => {
    alerts.push({
      id: `order-${order.id}`,
      severity: order.status === "PENDING" ? "CRITICAL" : "WARNING",
      category: "ORDER",
      title: `Pesanan ${order.table.name} belum selesai`,
      body: `${order.outlet.name}, status ${order.status}.`,
      href: "/pesanan-meja",
    });
  });

  return alerts.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

async function getNetSales(tenantId: string, outletIds: string[], start: Date, end: Date) {
  const sales = await prisma.sale.findMany({
    where: { tenantId, outletId: { in: outletIds }, status: "COMPLETED", createdAt: { gte: start, lt: end } },
    select: { total: true, saleReturns: { select: { totalRefund: true } } },
  });
  return sales.reduce((sum, sale) => sum + sale.total - sale.saleReturns.reduce((refund, item) => refund + item.totalRefund, 0), 0);
}

async function getDigitalSales(tenantId: string, outletIds: string[], start: Date, end: Date) {
  const result = await prisma.sale.aggregate({
    where: {
      tenantId,
      outletId: { in: outletIds },
      status: "COMPLETED",
      paymentMethod: { not: "CASH" },
      createdAt: { gte: start, lt: end },
    },
    _sum: { total: true },
  });
  return result._sum.total ?? 0;
}

function severityRank(severity: SimpleAlertSeverity) {
  return severity === "CRITICAL" ? 0 : severity === "WARNING" ? 1 : 2;
}
