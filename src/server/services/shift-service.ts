import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@prisma/client";

/** Batas selisih kas (Rp) yang masih dianggap wajar tanpa perlu catatan alasan. */
export const CASH_VARIANCE_THRESHOLD = 10000;

/**
 * Total penjualan per metode bayar dalam satu shift, termasuk porsi dari transaksi
 * split payment (Sale.isSplitPayment) yang rinciannya ada di SalePayment. Dipakai
 * buat rekonsiliasi kas (closeShift) dan ringkasan shift (getShiftSummary) supaya
 * keduanya selalu konsisten — jangan hitung total per metode di tempat lain.
 */
async function getPaymentMethodTotals(
  tenantId: string,
  shiftId: string
): Promise<Map<PaymentMethod, { amount: number; count: number }>> {
  const [nonSplitSales, splitPayments] = await Promise.all([
    prisma.sale.findMany({
      where: { tenantId, shiftId, status: "COMPLETED", isSplitPayment: false },
      select: { paymentMethod: true, total: true },
    }),
    prisma.salePayment.findMany({
      where: { tenantId, sale: { shiftId, status: "COMPLETED" } },
      select: { method: true, amount: true },
    }),
  ]);

  const totals = new Map<PaymentMethod, { amount: number; count: number }>();
  for (const sale of nonSplitSales) {
    const current = totals.get(sale.paymentMethod) ?? { amount: 0, count: 0 };
    totals.set(sale.paymentMethod, { amount: current.amount + sale.total, count: current.count + 1 });
  }
  for (const payment of splitPayments) {
    const current = totals.get(payment.method) ?? { amount: 0, count: 0 };
    totals.set(payment.method, { amount: current.amount + payment.amount, count: current.count + 1 });
  }
  return totals;
}

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
  const outlet = await prisma.outlet.findFirst({ where: { id: input.outletId, tenantId: input.tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");

  try {
    return await prisma.cashierShift.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        outletId: input.outletId,
        openingCash: input.openingCash,
        status: "OPEN",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Kamu masih punya shift yang terbuka. Tutup shift itu dulu sebelum buka yang baru.");
    }
    throw error;
  }
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

  const [methodTotals, totalCashback, cashOutTotal, cashRefundsTotal] = await Promise.all([
    getPaymentMethodTotals(input.tenantId, shift.id),
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
    (methodTotals.get("CASH")?.amount ?? 0) -
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

  const closed = await prisma.cashierShift.updateMany({
    where: { id: shift.id, tenantId: input.tenantId, status: "OPEN" },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      closingCash: input.closingCash,
      closingCashBreakdown: input.closingCashBreakdown ?? undefined,
      expectedCash,
      varianceNote,
    },
  });
  if (closed.count !== 1) {
    throw new Error("Shift ini sudah ditutup sebelumnya.");
  }
  return prisma.cashierShift.findFirstOrThrow({ where: { id: shift.id, tenantId: input.tenantId } });
}

export async function getShiftSummary(tenantId: string, shiftId: string) {
  const shift = await prisma.cashierShift.findFirst({
    where: { id: shiftId, tenantId },
    include: { outlet: true, user: true },
  });
  if (!shift) return null;

  const [sales, methodTotals, cashOutTransactions, saleReturns] = await Promise.all([
    prisma.sale.findMany({
      where: { tenantId, shiftId, status: "COMPLETED" },
    }),
    getPaymentMethodTotals(tenantId, shiftId),
    prisma.cashOutTransaction.findMany({
      where: { tenantId, shiftId, status: "COMPLETED" },
    }),
    prisma.saleReturn.findMany({
      where: { tenantId, shiftId },
      include: { sale: true },
    }),
  ]);

  const totalPenjualan = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalPenjualanCash = methodTotals.get("CASH")?.amount ?? 0;
  const jumlahTransaksiCash = methodTotals.get("CASH")?.count ?? 0;
  const digitalSalesByMethod = Array.from(methodTotals.entries())
    .filter(([method]) => method !== "CASH")
    .map(([method, value]) => ({ method, ...value }));
  const totalPenjualanDigital = digitalSalesByMethod.reduce((sum, m) => sum + m.amount, 0);
  const jumlahTransaksiDigital = digitalSalesByMethod.reduce((sum, m) => sum + m.count, 0);
  const jumlahTransaksi = sales.length;
  const totalCashback = sales.reduce((sum, sale) => sum + sale.cashbackAmount, 0);
  const totalGesekTunai = cashOutTransactions.reduce((sum, row) => sum + row.withdrawAmount, 0);
  const totalAdminGesekTunai = cashOutTransactions.reduce((sum, row) => sum + row.adminFee, 0);
  const totalTagihanGesekTunai = cashOutTransactions.reduce((sum, row) => sum + row.totalCharged, 0);
  const jumlahGesekTunai = cashOutTransactions.length;
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

/**
 * Riwayat shift yang sudah ditutup beserta selisih kasnya (closingCash vs expectedCash) —
 * dipakai buat lihat tren selisih kas antar shift, bukan cuma pas satu shift ditutup.
 */
export async function listClosedShiftsWithVariance(tenantId: string, outletIds: string[], take = 30) {
  const shifts = await prisma.cashierShift.findMany({
    where: { tenantId, outletId: { in: outletIds }, status: "CLOSED" },
    include: { outlet: true, user: true },
    orderBy: { closedAt: "desc" },
    take,
  });

  return shifts.map((shift) => ({
    id: shift.id,
    outletName: shift.outlet.name,
    cashierName: shift.user.name,
    closedAt: shift.closedAt,
    expectedCash: shift.expectedCash ?? 0,
    closingCash: shift.closingCash ?? 0,
    variance: (shift.closingCash ?? 0) - (shift.expectedCash ?? 0),
    varianceNote: shift.varianceNote,
  }));
}
