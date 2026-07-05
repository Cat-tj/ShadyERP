"use server";

import { revalidatePath } from "next/cache";
import type { EquipmentStatus, MaintenanceStatus } from "@prisma/client";
import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import {
  createEquipment,
  reportMaintenance,
  updateEquipmentStatus,
  updateMaintenanceStatus,
  type EquipmentInput,
  type MaintenanceInput,
} from "@/server/services/equipment-service";

export type ActionResult = { error?: string; success?: boolean };

export async function createEquipmentAction(input: EquipmentInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await createEquipment(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah alat." };
  }
  revalidatePath("/maintenance");
  return { success: true };
}

export async function reportMaintenanceAction(input: MaintenanceInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  try {
    await reportMaintenance(user.tenantId, outlets.map((outlet) => outlet.id), user.id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuat laporan maintenance." };
  }
  revalidatePath("/maintenance");
  return { success: true };
}

export async function updateEquipmentStatusAction(
  id: string,
  status: EquipmentStatus
): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await updateEquipmentStatus(user.tenantId, id, status);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status alat." };
  }
  revalidatePath("/maintenance");
  return { success: true };
}

export async function updateMaintenanceStatusAction(
  id: string,
  status: MaintenanceStatus,
  actionTaken?: string | null,
  cost?: number
): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await updateMaintenanceStatus(user.tenantId, id, status, actionTaken, cost);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status maintenance." };
  }
  revalidatePath("/maintenance");
  return { success: true };
}
