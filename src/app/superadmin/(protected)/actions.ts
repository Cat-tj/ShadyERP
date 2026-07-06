"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/server/require-super-admin";
import {
  setTenantActiveBySuperAdmin,
  reviewSubscriptionRequest,
} from "@/server/services/super-admin-service";
import { setDisabledModules } from "@/server/services/tenant-service";
import type { ModuleKey } from "@/lib/modules";

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

export async function reviewSubscriptionRequestAction(
  requestId: string,
  approve: boolean
): Promise<ActionResult> {
  await requireSuperAdmin();
  try {
    await reviewSubscriptionRequest(requestId, approve);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal memproses permintaan." };
  }
  revalidatePath("/superadmin");
  return { success: true };
}

export async function setTenantModulesAction(
  tenantId: string,
  disabledKeys: ModuleKey[]
): Promise<ActionResult> {
  await requireSuperAdmin();
  try {
    await setDisabledModules(tenantId, disabledKeys);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan modul tenant." };
  }
  revalidatePath("/superadmin");
  revalidatePath("/", "layout");
  return { success: true };
}
