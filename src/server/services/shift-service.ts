import { prisma } from "@/lib/prisma";

/** Batas selisih kas (Rp) yang masih dianggap wajar tanpa perlu catatan alasan. */
export const CASH_VARIANCE_THRESHOLD = 10000;

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */
export async function getOpenShift(tenantId: string, userId: string) {
  return prisma.cashierShift.findFirst({
    where: { tenantId, userId, status: "OPEN" },
    include: { outlet: true },
  });
}

export async function openShift(input: {
  tenantId: string;
  userId: string;
  outletId: string;
  openingCash: number;
}) {
  const existing = await getOpenShift(input.tenantId, input.userId);
  if (existing) {
    throw new Error("Kamu masih punya shift yang terbuka. Tutup shift itu dulu sebelum buka yang baru.");
  }

  return prisma.cashierShift.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      outletId: input.outletId,
      openingCash: input.openingCash,
      status: "OPEN",
    },
  });
}

export async function closeShift(input: {
  tenantId: string;
  shiftId: string;
  closingCash: number;
  /** Rincian jumlah lembar/koin per pecahan (mis. {"100000": 5}) — opsional, hasil kalkulator pecahan uang. */
  closingCashBreakdown?: Record<string, number>;
  /** Catatan alasan selisih kas — wajib diisi kalau selisih melebihi CASH_VARIANCE_THRESHOLD. */
  varianceNote?: string;
}) {
  const shift = await prisma.cashierShift.findFirst({
    where: { id: input.shiftId, tenantId: input.tenantId },
  });
  if (!shift) {
    throw new Error("Shift tidak ditemukan.");
  }
  if (shift.status === "CLOSED") {
    throw new Error("Shift ini sudah ditutup sebelumnya.");
  }

  const [cashSalesTotal, totalCashback, cashOutTotal, cashRefundsTotal] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        tenantId: input.tenantId,
        shiftId: shift.id,
        status: "COMPLETED",
        paymentMethod: "CASH",
      },
      _sum: { total: true },
    }),
    prisma.sale.aggregate({
      where: {
        tenantId: input.tenantId,
        shiftId: shift.id,
        status: "COMPLETED",
      },
      _sum: { cashbackAmount: true },
    }),
    prisma.cashOutTransaction.aggregate({
      where: {
        tenantId: input.tenantId,
        shiftId: shift.id,
        status: "COMPLETED",
      },
      _sum: { withdrawAmount: true },
    }),
    prisma.saleReturn.aggregate({
      where: {
        tenantId: input.tenantId,
        shiftId: shift.id,
        refundMethod: "CASH",
      },
      _sum: { totalRefund: true },
    }),
  ]);

  const expectedCash =
    shift.openingCash +
    (cashSalesTotal._sum?.total ?? 0) -
    (totalCashback._sum?.cashbackAmount ?? 0) -
    (cashOutTotal._sum?.withdrawAmount ?? 0) -
    (cashRefundsTotal._sum?.totalRefund ?? 0);

  const varianceNote = input.varianceNote?.trim() || undefined;
  const selisih = Math.abs(input.closingCash - expectedCash);
  if (selisih > CASH_VARIANCE_THRESHOLD && !varianceNote) {
    throw new Error(
      `Selisih kas ${selisih.toLocaleString("id-ID")} melebihi batas wajar (Rp${CASH_VARIANCE_THRESHOLD.toLocaleString("id-ID")}). Isi catatan alasan dulu sebelum tutup shift.`
    );
  }

  return prisma.cashierShift.update({
    where: { id: shift.id },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      closingCash: input.closingCash,
      closingCashBreakdown: input.closingCashBreakdown ?? undefined,
      expectedCash,
      varianceNote,
    },
  });
}

export async function getShiftSummary(tenantId: string, shiftId: string) {
  const shift = await prisma.cashierShift.findFirst({
    where: { id: shiftId, tenantId },
    include: { outlet: true, user: true },
  });
  if (!shift) return null;

  const [sales, cashOutTransactions, saleReturns] = await Promise.all([
    prisma.sale.findMany({
      where: { tenantId, shiftId, status: "COMPLETED" },
    }),
    prisma.cashOutTransaction.findMany({
      where: { tenantId, shiftId, status: "COMPLETED" },
    }),
    prisma.saleReturn.findMany({
      where: { tenantId, shiftId },
      include: { sale: true },
    }),
  ]);

  const cashSales = sales.filter((sale) => sale.paymentMethod === "CASH");
  const digitalSales = sales.filter((sale) => sale.paymentMethod !== "CASH");
  const totalPenjualan = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalPenjualanCash = cashSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalPenjualanDigital = digitalSales.reduce((sum, sale) => sum + sale.total, 0);
  const jumlahTransaksi = sales.length;
  const jumlahTransaksiCash = cashSales.length;
  const jumlahTransaksiDigital = digitalSales.length;
  const totalCashback = sales.reduce((sum, sale) => sum + sale.cashbackAmount, 0);
  const totalGesekTunai = cashOutTransactions.reduce((sum, row) => sum + row.withdrawAmount, 0);
  const totalAdminGesekTunai = cashOutTransactions.reduce((sum, row) => sum + row.adminFee, 0);
  const totalTagihanGesekTunai = cashOutTransactions.reduce((sum, row) => sum + row.totalCharged, 0);
  const jumlahGesekTunai = cashOutTransactions.length;
  const digitalSalesByMethod = Object.entries(
    digitalSales.reduce<Record<string, { amount: number; count: number }>>((map, sale) => {
      const current = map[sale.paymentMethod] ?? { amount: 0, count: 0 };
      map[sale.paymentMethod] = { amount: current.amount + sale.total, count: current.count + 1 };
      return map;
    }, {})
  ).map(([method, value]) => ({ method, ...value }));
  const cashOutByMethod = Object.entries(
    cashOutTransactions.reduce<Record<string, { amount: number; count: number }>>((map, row) => {
      const current = map[row.method] ?? { amount: 0, count: 0 };
      map[row.method] = { amount: current.amount + row.totalCharged, count: current.count + 1 };
      return map;
    }, {})
  ).map(([method, value]) => ({ method, ...value }));

  const cashReturns = saleReturns.filter((sr) => sr.refundMethod === "CASH");
  const digitalReturns = saleReturns.filter((sr) => sr.refundMethod !== "CASH");
  const totalRefundCash = cashReturns.reduce((sum, sr) => sum + sr.totalRefund, 0);
  const totalRefundDigital = digitalReturns.reduce((sum, sr) => sum + sr.totalRefund, 0);
  const jumlahRetur = saleReturns.length;

  return {
    shift,
    totalPenjualan,
    totalPenjualanCash,
    totalPenjualanDigital,
    jumlahTransaksi,
    jumlahTransaksiCash,
    jumlahTransaksiDigital,
    totalCashback,
    totalGesekTunai,
    totalAdminGesekTunai,
    totalTagihanGesekTunai,
    jumlahGesekTunai,
    digitalSalesByMethod,
    cashOutByMethod,
    totalRefundCash,
    totalRefundDigital,
    jumlahRetur,
  };
}
