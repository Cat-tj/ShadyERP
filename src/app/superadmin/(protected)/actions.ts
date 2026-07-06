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
  recordSuperAdminAuditLog,
} from "@/server/services/super-admin-service";
import { setDisabledModules } from "@/server/services/tenant-service";
import type { ModuleKey } from "@/lib/modules";
import type { Plan } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export async function setTenantActiveAction(tenantId: string, isActive: boolean): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  try {
    await setTenantActiveBySuperAdmin(tenantId, isActive);
    await recordSuperAdminAuditLog({
      actorId: admin.id,
      action: isActive ? "TENANT_ACTIVATE" : "TENANT_SUSPEND",
      targetTenantId: tenantId,
      description: `${admin.email} ${isActive ? "mengaktifkan" : "mensuspend"} tenant ${tenantId}`,
      afterJson: { isActive },
    });
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
  const admin = await requireSuperAdmin();
  try {
    await reviewSubscriptionRequest(requestId, approve);
    await recordSuperAdminAuditLog({
      actorId: admin.id,
      action: approve ? "SUBSCRIPTION_APPROVE" : "SUBSCRIPTION_REJECT",
      description: `${admin.email} ${approve ? "menyetujui" : "menolak"} request langganan ${requestId}`,
      afterJson: { requestId, approve },
    });
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
  const admin = await requireSuperAdmin();
  try {
    await setDisabledModules(tenantId, disabledKeys);
    await recordSuperAdminAuditLog({
      actorId: admin.id,
      action: "TENANT_MODULES_UPDATE",
      targetTenantId: tenantId,
      description: `${admin.email} mengubah modul tenant ${tenantId}`,
      afterJson: { disabledKeys },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan modul tenant." };
  }
  revalidatePath("/superadmin");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function changeTenantPlanAction(tenantId: string, plan: Plan): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  try {
    await changeTenantPlan(tenantId, plan);
    await recordSuperAdminAuditLog({
      actorId: admin.id,
      action: "TENANT_PLAN_CHANGE",
      targetTenantId: tenantId,
      description: `${admin.email} mengubah paket tenant ${tenantId} ke ${plan}`,
      afterJson: { plan },
    });
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
  const admin = await requireSuperAdmin();
  try {
    await changeTenantAccountingMode(tenantId, mode);
    await recordSuperAdminAuditLog({
      actorId: admin.id,
      action: "TENANT_ACCOUNTING_MODE_CHANGE",
      targetTenantId: tenantId,
      description: `${admin.email} mengubah mode akuntansi tenant ${tenantId} ke ${mode}`,
      afterJson: { mode },
    });
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
  const admin = await requireSuperAdmin();
  try {
    const created = await createSuperAdminAccount(input);
    await recordSuperAdminAuditLog({
      actorId: admin.id,
      action: "SUPERADMIN_ACCOUNT_UPSERT",
      description: `${admin.email} membuat/reset akun superadmin ${created.email}`,
      afterJson: { email: created.email, name: created.name },
    });
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
  const admin = await requireSuperAdmin();
  try {
    const changed = await changeSuperAdminPassword(superAdminId, password);
    await recordSuperAdminAuditLog({
      actorId: admin.id,
      action: "SUPERADMIN_PASSWORD_RESET",
      description: `${admin.email} mereset password superadmin ${changed.email}`,
      afterJson: { superAdminId },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah password superadmin." };
  }
  revalidatePath("/superadmin/admins");
  return { success: true };
}
