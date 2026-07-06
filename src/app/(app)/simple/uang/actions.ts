"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createCashFlow, deleteCashFlow } from "@/server/services/cashflow-service";
import type { CashFlowType } from "@prisma/client";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createSimpleCashFlowAction(input: {
  outletId: string;
  type: CashFlowType;
  category: string;
  amount: number;
  note?: string;
  spentAtStr?: string;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    await createCashFlow(user.tenantId, user.id, {
      outletId: input.outletId,
      type: input.type,
      category: input.category,
      amount: input.amount,
      note: input.note,
      spentAt: input.spentAtStr ? new Date(input.spentAtStr) : new Date(),
    });
    revalidatePath("/simple/uang");
    revalidatePath("/finance/kas");
    return { succeeded: true };
  } catch (error: unknown) {
    return { succeeded: false, message: getErrorMessage(error, "Gagal mencatat uang.") };
  }
}

export async function deleteSimpleCashFlowAction(id: string) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    await deleteCashFlow(user.tenantId, id);
    revalidatePath("/simple/uang");
    revalidatePath("/finance/kas");
    return { succeeded: true };
  } catch (error: unknown) {
    return { succeeded: false, message: getErrorMessage(error, "Gagal menghapus catatan.") };
  }
}
