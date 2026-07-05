"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { buildDynamicQris } from "@/lib/qris-dynamic";
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
  if (input.staticQrisPayload?.trim()) {
    try {
      buildDynamicQris(input.staticQrisPayload, 1000);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Payload QRIS tidak valid.",
      };
    }
  }
  try {
    await updateTenantSetting(user.tenantId, {
      ...input,
      staticQrisPayload: input.staticQrisPayload?.trim() || null,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan pengaturan." };
  }
  revalidatePath("/pengaturan/bisnis");
  revalidatePath("/kasir");
  return { success: true };
}
