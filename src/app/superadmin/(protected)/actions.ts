"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/server/require-super-admin";
import {
  setTenantActiveBySuperAdmin,
  reviewSubscriptionRequest,
  changeTenantPlan,
  changeTenantAccountingMode,
  createSuperAdminAccount,
  changeSuperAdminPassword,
} from "@/server/services/super-admin-service";
import { setDisabledModules } from "@/server/services/tenant-service";
import type { ModuleKey } from "@/lib/modules";
import type { Plan } from "@prisma/client";

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

export async function changeTenantPlanAction(tenantId: string, plan: Plan): Promise<ActionResult> {
  await requireSuperAdmin();
  try {
    await changeTenantPlan(tenantId, plan);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah paket tenant." };
  }
  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/tenant/${tenantId}`);
  return { success: true };
}

export async function changeTenantAccountingModeAction(
  tenantId: string,
  mode: "SIMPLE" | "ADVANCED"
): Promise<ActionResult> {
  await requireSuperAdmin();
  try {
    await changeTenantAccountingMode(tenantId, mode);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah mode akuntansi tenant." };
  }
  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/tenant/${tenantId}`);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function createSuperAdminAccountAction(input: {
  email: string;
  name: string;
  password: string;
}): Promise<ActionResult> {
  await requireSuperAdmin();
  try {
    await createSuperAdminAccount(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuat akun superadmin." };
  }
  revalidatePath("/superadmin/admins");
  return { success: true };
}

export async function changeSuperAdminPasswordAction(
  superAdminId: string,
  password: string
): Promise<ActionResult> {
  await requireSuperAdmin();
  try {
    await changeSuperAdminPassword(superAdminId, password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah password superadmin." };
  }
  revalidatePath("/superadmin/admins");
  return { success: true };
}
