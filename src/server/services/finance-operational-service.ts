import { prisma } from "@/lib/prisma";
import { todayRangeJakarta } from "@/lib/date-range";

function rangeForDays(days: number) {
  const { end } = todayRangeJakarta();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function getPaymentMethodSummary(tenantId: string, outletIds: string[], days: number) {
  const { start, end } = rangeForDays(days);
  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      status: "COMPLETED",
      createdAt: { gte: start, lt: end },
    },
    select: {
      paymentMethod: true,
      total: true,
      saleReturns: { select: { totalRefund: true } },
    },
  });

  const byMethod = new Map<string, { amount: number; count: number }>();
  for (const sale of sales) {
    const refund = sale.saleReturns.reduce((sum, item) => sum + item.totalRefund, 0);
    const netTotal = sale.total - refund;
    const current = byMethod.get(sale.paymentMethod) ?? { amount: 0, count: 0 };
    current.amount += netTotal;
    current.count += 1;
    byMethod.set(sale.paymentMethod, current);
  }

  const total = Array.from(byMethod.values()).reduce((sum, item) => sum + item.amount, 0);

  return Array.from(byMethod.entries())
    .map(([method, value]) => ({
      method,
      amount: value.amount,
      count: value.count,
      percentage: total > 0 ? Math.round((value.amount / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getCashOutletSummary(tenantId: string, outletIds: string[], days: number) {
  const { start, end } = rangeForDays(days);
  const outlets = await prisma.outlet.findMany({
    where: { tenantId, id: { in: outletIds } },
    orderBy: { name: "asc" },
  });

  const [cashSales, expenses, shifts] = await Promise.all([
    prisma.sale.groupBy({
      by: ["outletId"],
      where: {
        tenantId,
        outletId: { in: outletIds },
        status: "COMPLETED",
        paymentMethod: "CASH",
        createdAt: { gte: start, lt: end },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.expense.groupBy({
      by: ["outletId"],
      where: {
        tenantId,
        outletId: { in: outletIds },
        spentAt: { gte: start, lt: end },
      },
      _sum: { amount: true },
    }),
    prisma.cashierShift.findMany({
      where: {
        tenantId,
        outletId: { in: outletIds },
        openedAt: { gte: start, lt: end },
      },
      select: {
        outletId: true,
        status: true,
        openingCash: true,
        closingCash: true,
        expectedCash: true,
      },
    }),
  ]);

  const cashSaleMap = new Map(cashSales.map((item) => [item.outletId, item]));
  const expenseMap = new Map(expenses.map((item) => [item.outletId, item._sum.amount ?? 0]));

  return outlets.map((outlet) => {
    const outletShifts = shifts.filter((shift) => shift.outletId === outlet.id);
    const openingCash = outletShifts.reduce((sum, shift) => sum + shift.openingCash, 0);
    const closingCash = outletShifts.reduce((sum, shift) => sum + (shift.closingCash ?? 0), 0);
    const expectedCash = outletShifts.reduce((sum, shift) => sum + (shift.expectedCash ?? 0), 0);
    const openShiftCount = outletShifts.filter((shift) => shift.status === "OPEN").length;
    const closedShiftCount = outletShifts.filter((shift) => shift.status === "CLOSED").length;
    const cashSalesTotal = cashSaleMap.get(outlet.id)?._sum.total ?? 0;
    const cashExpenseTotal = expenseMap.get(outlet.id) ?? 0;

    return {
      outletId: outlet.id,
      outletName: outlet.name,
      openingCash,
      cashSales: cashSalesTotal,
      expenses: cashExpenseTotal,
      estimatedCash: openingCash + cashSalesTotal - cashExpenseTotal,
      closingCash,
      expectedCash,
      discrepancy: closingCash - expectedCash,
      openShiftCount,
      closedShiftCount,
      cashTransactionCount: cashSaleMap.get(outlet.id)?._count.id ?? 0,
    };
  });
}

export async function getSupplierDebtSummary(tenantId: string) {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      tenantId,
      status: { not: "CANCELLED" },
    },
    include: {
      supplier: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const payableStatuses = new Set(["SENT", "CONFIRMED", "PARTIALLY_RECEIVED", "RECEIVED"]);
  const active = purchaseOrders.filter((po) => payableStatuses.has(po.status));
  const totalEstimatedPayable = active.reduce((sum, po) => sum + po.totalAmount, 0);

  const bySupplier = new Map<string, { supplierName: string; amount: number; count: number }>();
  for (const po of active) {
    const supplierName = po.supplier.name;
    const current = bySupplier.get(po.supplierId) ?? { supplierName, amount: 0, count: 0 };
    current.amount += po.totalAmount;
    current.count += 1;
    bySupplier.set(po.supplierId, current);
  }

  return {
    totalEstimatedPayable,
    activeCount: active.length,
    draftCount: purchaseOrders.filter((po) => po.status === "DRAFT").length,
    bySupplier: Array.from(bySupplier.values()).sort((a, b) => b.amount - a.amount),
    recent: purchaseOrders.slice(0, 10).map((po) => ({
      id: po.id,
      poNumber: po.poNumber,
      supplierName: po.supplier.name,
      status: po.status,
      totalAmount: po.totalAmount,
      expectedAt: po.expectedAt,
      createdAt: po.createdAt,
    })),
  };
}
