"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { setPeriodLockDate, clearPeriodLockDate } from "@/server/services/accounting-service";

export type ActionResult = { error?: string; success?: boolean };

export async function lockPeriodAction(lockDateStr: string): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);

  const lockDate = new Date(`${lockDateStr}T23:59:59`);
  if (Number.isNaN(lockDate.getTime())) {
    return { error: "Tanggal tidak valid." };
  }

  try {
    await setPeriodLockDate(user.tenantId, lockDate, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menutup buku." };
  }

  revalidatePath("/finance/tutup-buku");
  return { success: true };
}

export async function unlockPeriodAction(): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);

  try {
    await clearPeriodLockDate(user.tenantId, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuka kunci." };
  }

  revalidatePath("/finance/tutup-buku");
  return { success: true };
}
