import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";
import type { CashOutMethod } from "@prisma/client";

export type CreateCashOutInput = {
  tenantId: string;
  outletId: string;
  shiftId: string;
  cashierId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  withdrawAmount: number;
  adminFee: number;
  method: CashOutMethod;
  note?: string | null;
};

export async function createCashOutTransaction(input: CreateCashOutInput) {
  const withdrawAmount = Math.round(input.withdrawAmount);
  const adminFee = Math.round(input.adminFee);

  if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
    throw new Error("Nominal gesek tunai harus lebih dari 0.");
  }
  if (!Number.isFinite(adminFee) || adminFee < 0) {
    throw new Error("Admin fee tidak valid.");
  }

  const shift = await prisma.cashierShift.findFirst({
    where: {
      id: input.shiftId,
      tenantId: input.tenantId,
      outletId: input.outletId,
      userId: input.cashierId,
      status: "OPEN",
    },
  });
  if (!shift) {
    throw new Error("Shift kasir belum dibuka atau sudah ditutup.");
  }

  return prisma.cashOutTransaction.create({
    data: {
      tenantId: input.tenantId,
      outletId: input.outletId,
      shiftId: input.shiftId,
      cashierId: input.cashierId,
      referenceNumber: `GSK-${ulid()}`,
      customerName: input.customerName?.trim() || null,
      customerPhone: input.customerPhone?.trim() || null,
      withdrawAmount,
      adminFee,
      totalCharged: withdrawAmount + adminFee,
      method: input.method,
      note: input.note?.trim() || null,
    },
  });
}

export async function listCashOutTransactions(tenantId: string, outletIds: string[], take = 100) {
  if (outletIds.length === 0) return [];

  return prisma.cashOutTransaction.findMany({
    where: { tenantId, outletId: { in: outletIds } },
    include: { outlet: true, cashier: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}
