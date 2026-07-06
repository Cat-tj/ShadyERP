"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createCashFlow, deleteCashFlow, type CashFlowInput } from "@/server/services/cashflow-service";
import type { CashFlowType } from "@prisma/client";

export async function createCashFlowAction(input: {
  outletId: string;
  type: CashFlowType;
  category: string;
  amount: number;
  note?: string;
  spentAtStr?: string;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    const spentAt = input.spentAtStr ? new Date(input.spentAtStr) : new Date();
    await createCashFlow(user.tenantId, user.id, {
      outletId: input.outletId,
      type: input.type,
      category: input.category,
      amount: input.amount,
      note: input.note,
      spentAt,
    });

    revalidatePath("/finance/kas");
    return { succeeded: true };
  } catch (error: any) {
    return { succeeded: false, message: error?.message || "Terjadi kesalahan internal." };
  }
}

export async function deleteCashFlowAction(id: string) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    await deleteCashFlow(user.tenantId, id);
    revalidatePath("/finance/kas");
    return { succeeded: true };
  } catch (error: any) {
    return { succeeded: false, message: error?.message || "Terjadi kesalahan internal." };
  }
}
