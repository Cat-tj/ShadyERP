"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createUser, updateUser, setUserActive, type UserInput } from "@/server/services/user-service";
import { validateCashierPin } from "@/server/validation/user-input";

export type ActionResult = { error?: string; success?: boolean };

export async function createUserAction(input: UserInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  if (!input.name.trim()) return { error: "Nama wajib diisi." };
  if (!input.email.trim()) return { error: "Email wajib diisi." };
  if (!input.password || input.password.length < 6) {
    return { error: "Kata sandi minimal 6 karakter." };
  }
  const pinError = validateCashierPin(input.pin);
  if (pinError) return { error: pinError };
  try {
    await createUser(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah karyawan." };
  }
  revalidatePath("/pengaturan/karyawan");
  return { success: true };
}

export async function updateUserAction(
  id: string,
  input: Omit<UserInput, "password"> & { password?: string }
): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  if (!input.name.trim()) return { error: "Nama wajib diisi." };
  if (input.password && input.password.length < 6) {
    return { error: "Kata sandi minimal 6 karakter." };
  }
  const pinError = validateCashierPin(input.pin);
  if (pinError) return { error: pinError };
  try {
    await updateUser(user.tenantId, id, input, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah karyawan." };
  }
  revalidatePath("/pengaturan/karyawan");
  return { success: true };
}

export async function toggleUserActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const actor = await requireRole(["OWNER"]);
  try {
    await setUserActive(actor.tenantId, id, isActive, actor.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status karyawan." };
  }
  revalidatePath("/pengaturan/karyawan");
  return { success: true };
}
