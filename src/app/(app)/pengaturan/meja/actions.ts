"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createTable, updateTable, setTableActive } from "@/server/services/table-service";

export type ActionResult = { error?: string; success?: boolean };

export async function createTableAction(
  outletId: string,
  name: string,
  posX?: number,
  posY?: number,
  floor?: number,
  shape?: string,
  capacity?: number
): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  if (!name.trim()) return { error: "Nama meja wajib diisi." };
  try {
    await createTable(user.tenantId, outletId, name, posX, posY, floor, shape, capacity);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah meja." };
  }
  revalidatePath("/pengaturan/meja");
  return { success: true };
}

export async function updateTableAction(
  id: string,
  name: string,
  posX?: number,
  posY?: number,
  floor?: number,
  shape?: string,
  capacity?: number
): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  if (!name.trim()) return { error: "Nama meja wajib diisi." };
  try {
    await updateTable(user.tenantId, id, name, posX, posY, floor, shape, capacity);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah meja." };
  }
  revalidatePath("/pengaturan/meja");
  return { success: true };
}

export async function toggleTableActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  try {
    await setTableActive(user.tenantId, id, isActive);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status meja." };
  }
  revalidatePath("/pengaturan/meja");
  return { success: true };
}
