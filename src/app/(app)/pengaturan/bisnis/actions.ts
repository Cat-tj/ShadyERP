"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { updateTenantSetting, type TenantSettingInput } from "@/server/services/tenant-service";

export type ActionResult = { error?: string; success?: boolean };

export async function updateTenantSettingAction(input: TenantSettingInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  if (!Number.isFinite(input.taxPercent) || input.taxPercent < 0 || input.taxPercent > 100) {
    return { error: "Pajak harus antara 0-100%." };
  }
  if (!Number.isFinite(input.pointsPerAmount) || input.pointsPerAmount <= 0) {
    return { error: "Rasio poin harus lebih dari 0." };
  }
  try {
    await updateTenantSetting(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan pengaturan." };
  }
  revalidatePath("/pengaturan/bisnis");
  return { success: true };
}
