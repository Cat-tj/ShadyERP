"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import {
  createOutlet,
  updateOutlet,
  setOutletActive,
  type OutletInput,
} from "@/server/services/outlet-service";

export type ActionResult = { error?: string; success?: boolean };

export async function createOutletAction(input: OutletInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  if (!input.name.trim()) return { error: "Nama outlet wajib diisi." };
  try {
    await createOutlet(user.tenantId, user.id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah outlet." };
  }
  revalidatePath("/pengaturan/outlet");
  return { success: true };
}

export async function updateOutletAction(id: string, input: OutletInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  if (!input.name.trim()) return { error: "Nama outlet wajib diisi." };
  try {
    await updateOutlet(user.tenantId, id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah outlet." };
  }
  revalidatePath("/pengaturan/outlet");
  return { success: true };
}

export async function toggleOutletActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  try {
    await setOutletActive(user.tenantId, id, isActive);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status outlet." };
  }
  revalidatePath("/pengaturan/outlet");
  return { success: true };
}
