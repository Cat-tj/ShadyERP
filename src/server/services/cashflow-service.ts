import { prisma } from "@/lib/prisma";
import type { CashFlowType } from "@prisma/client";

export interface CashFlowInput {
  outletId: string;
  type: CashFlowType;
  category: string;
  amount: number;
  note?: string | null;
  spentAt?: Date;
}

export async function createCashFlow(tenantId: string, createdById: string, input: CashFlowInput) {
  if (input.amount <= 0) throw new Error("Nominal transaksi harus lebih besar dari nol.");

  return prisma.cashFlow.create({
    data: {
      tenantId,
      outletId: input.outletId,
      createdById,
      type: input.type,
      category: input.category,
      amount: input.amount,
      note: input.note || null,
      spentAt: input.spentAt || new Date(),
    },
  });
}

export async function listCashFlows(tenantId: string, outletIds: string[], days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return prisma.cashFlow.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      spentAt: { gte: cutoff },
    },
    include: {
      outlet: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { spentAt: "desc" },
  });
}

export async function deleteCashFlow(tenantId: string, id: string) {
  const flow = await prisma.cashFlow.findFirst({ where: { id, tenantId } });
  if (!flow) throw new Error("Transaksi kas tidak ditemukan.");

  return prisma.cashFlow.delete({ where: { id } });
}
