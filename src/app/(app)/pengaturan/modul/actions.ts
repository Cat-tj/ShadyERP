"use server";

import { requireRole } from "@/server/require-session";
import type { ModuleKey } from "@/lib/modules";

export type ActionResult = { error?: string; success?: boolean };

export async function updateDisabledModulesAction(_disabledKeys: ModuleKey[]): Promise<ActionResult> {
  void _disabledKeys;
  await requireRole(["OWNER"]);
  return { error: "Modul toko sekarang dikelola oleh Superadmin Altora." };
}
