"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { setDisabledModules } from "@/server/services/tenant-service";
import type { ModuleKey } from "@/lib/modules";

export type ActionResult = { error?: string; success?: boolean };

export async function updateDisabledModulesAction(disabledKeys: ModuleKey[]): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  try {
    await setDisabledModules(user.tenantId, disabledKeys);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan modul." };
  }
  revalidatePath("/", "layout");
  return { success: true };
}
