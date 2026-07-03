"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/server/require-super-admin";
import { setTenantActiveBySuperAdmin } from "@/server/services/super-admin-service";

export type ActionResult = { error?: string; success?: boolean };

export async function setTenantActiveAction(tenantId: string, isActive: boolean): Promise<ActionResult> {
  await requireSuperAdmin();
  try {
    await setTenantActiveBySuperAdmin(tenantId, isActive);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status tenant." };
  }
  revalidatePath("/superadmin");
  return { success: true };
}
