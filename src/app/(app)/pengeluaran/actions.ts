"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createExpense, deleteExpense, type ExpenseInput } from "@/server/services/expense-service";
import type { ExpenseCategory } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

const MANAGE_ROLES = ["OWNER", "MANAGER"] as const;

export type CreateExpenseInput = {
  outletId: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  spentAt?: string;
};

export async function createExpenseAction(input: CreateExpenseInput): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    const data: ExpenseInput = {
      outletId: input.outletId,
      category: input.category,
      amount: input.amount,
      note: input.note,
      spentAt: input.spentAt ? new Date(input.spentAt) : undefined,
    };
    await createExpense(user.tenantId, user.id, data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mencatat pengeluaran." };
  }
  revalidatePath("/pengeluaran");
  revalidatePath("/laporan");
  return { success: true };
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const user = await requireRole([...MANAGE_ROLES]);
  try {
    await deleteExpense(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus pengeluaran." };
  }
  revalidatePath("/pengeluaran");
  revalidatePath("/laporan");
  return { success: true };
}
