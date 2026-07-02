"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { assignCardToMember } from "@/server/services/uid-card-service";
import { updateMemberInfo } from "@/server/services/member-service";

export type ActionResult = { error?: string; success?: boolean };

export async function assignCardAction(memberId: string, serialNumber: string): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  if (!serialNumber.trim()) return { error: "Nomor seri kartu wajib diisi." };
  try {
    await assignCardToMember(user.tenantId, memberId, serialNumber);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghubungkan kartu." };
  }
  revalidatePath(`/member/${memberId}`);
  return { success: true };
}

export async function updateMemberAction(
  memberId: string,
  input: { name: string; phone: string; email?: string | null }
): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await updateMemberInfo(user.tenantId, memberId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan data member." };
  }
  revalidatePath(`/member/${memberId}`);
  revalidatePath("/member");
  return { success: true };
}
