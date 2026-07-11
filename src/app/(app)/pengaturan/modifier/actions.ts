"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import {
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  createModifierOption,
  updateModifierOption,
  deleteModifierOption,
  type ModifierGroupInput,
  type ModifierOptionInput,
} from "@/server/services/modifier-service";

export type ActionResult = { error?: string; success?: boolean };
export type CreateResult = ActionResult & { id?: string };

function revalidateAffectedPaths() {
  revalidatePath("/pengaturan/modifier");
  revalidatePath("/produk");
  revalidatePath("/kasir");
  revalidatePath("/pesan/[qrToken]", "page");
}

export async function createModifierGroupAction(
  categoryId: string,
  input: ModifierGroupInput
): Promise<CreateResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  if (!input.name.trim()) return { error: "Nama grup modifier wajib diisi." };
  let group;
  try {
    group = await createModifierGroup(user.tenantId, categoryId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah grup modifier." };
  }
  revalidateAffectedPaths();
  return { success: true, id: group.id };
}

export async function updateModifierGroupAction(id: string, input: ModifierGroupInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  if (!input.name.trim()) return { error: "Nama grup modifier wajib diisi." };
  try {
    await updateModifierGroup(user.tenantId, id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah grup modifier." };
  }
  revalidateAffectedPaths();
  return { success: true };
}

export async function deleteModifierGroupAction(id: string): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await deleteModifierGroup(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus grup modifier." };
  }
  revalidateAffectedPaths();
  return { success: true };
}

export async function createModifierOptionAction(
  modifierGroupId: string,
  input: ModifierOptionInput
): Promise<CreateResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  if (!input.name.trim()) return { error: "Nama opsi modifier wajib diisi." };
  let option;
  try {
    option = await createModifierOption(user.tenantId, modifierGroupId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah opsi modifier." };
  }
  revalidateAffectedPaths();
  return { success: true, id: option.id };
}

export async function updateModifierOptionAction(id: string, input: ModifierOptionInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  if (!input.name.trim()) return { error: "Nama opsi modifier wajib diisi." };
  try {
    await updateModifierOption(user.tenantId, id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah opsi modifier." };
  }
  revalidateAffectedPaths();
  return { success: true };
}

export async function deleteModifierOptionAction(id: string): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await deleteModifierOption(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus opsi modifier." };
  }
  revalidateAffectedPaths();
  return { success: true };
}
