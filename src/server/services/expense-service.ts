import { prisma } from "@/lib/prisma";
import type { ExpenseCategory } from "@prisma/client";
import { todayRangeJakarta } from "@/lib/date-range";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

function rangeForDays(days: number) {
  const { end } = todayRangeJakarta();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export type ExpenseInput = {
  outletId: string;
  category: ExpenseCategory;
  amount: number;
  note?: string | null;
  spentAt?: Date;
};

export async function createExpense(tenantId: string, createdById: string, input: ExpenseInput) {
  const outlet = await prisma.outlet.findFirst({ where: { id: input.outletId, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Jumlah pengeluaran tidak valid.");
  }

  return prisma.expense.create({
    data: {
      tenantId,
      outletId: input.outletId,
      createdById,
      category: input.category,
      amount: input.amount,
      note: input.note?.trim() || null,
      spentAt: input.spentAt ?? new Date(),
    },
  });
}

export async function listExpenses(tenantId: string, outletIds: string[], days: number) {
  const { start, end } = rangeForDays(days);
  return prisma.expense.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      spentAt: { gte: start, lt: end },
    },
    include: { outlet: true, createdBy: true },
    orderBy: { spentAt: "desc" },
  });
}

export async function deleteExpense(tenantId: string, id: string) {
  const expense = await prisma.expense.findFirst({ where: { id, tenantId } });
  if (!expense) throw new Error("Pengeluaran tidak ditemukan.");
  return prisma.expense.delete({ where: { id } });
}

export async function getExpenseSummary(tenantId: string, outletIds: string[], days: number) {
  const { start, end } = rangeForDays(days);
  const expenses = await prisma.expense.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      spentAt: { gte: start, lt: end },
    },
    select: { amount: true, category: true },
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = new Map<ExpenseCategory, number>();
  for (const expense of expenses) {
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount);
  }

  return {
    totalExpense,
    byCategory: Array.from(byCategory.entries()).map(([category, amount]) => ({ category, amount })),
  };
}
