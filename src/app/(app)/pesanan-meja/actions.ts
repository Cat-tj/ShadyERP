"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/require-session";
import { updateOrderStatus } from "@/server/services/table-order-service";
import type { TableOrderStatus } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export async function updateOrderStatusAction(
  id: string,
  status: TableOrderStatus
): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await updateOrderStatus(user.tenantId, id, status);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memperbarui pesanan." };
  }
  revalidatePath("/pesanan-meja");
  return { success: true };
}
