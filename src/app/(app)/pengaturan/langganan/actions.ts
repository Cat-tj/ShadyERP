"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { requestUpgrade } from "@/server/services/billing-service";
import type { Plan } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export async function requestUpgradeAction(requestedPlan: Plan, note?: string): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  try {
    await requestUpgrade(user.tenantId, requestedPlan, note);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengajukan upgrade." };
  }
  revalidatePath("/pengaturan/langganan");
  return { success: true };
}
