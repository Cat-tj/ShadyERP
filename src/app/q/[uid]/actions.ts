"use server";

import { revalidatePath } from "next/cache";
import { registerMemberForCard } from "@/server/services/uid-card-service";
import { redeemPoints } from "@/server/services/member-service";

export type ActionResult = { error?: string; success?: boolean };

export async function registerMemberAction(
  uid: string,
  input: { name: string; phone: string; email?: string }
): Promise<ActionResult> {
  if (!input.name.trim()) return { error: "Nama wajib diisi." };
  if (!input.phone.trim() || input.phone.trim().length < 8) {
    return { error: "Nomor HP tidak valid." };
  }
  try {
    await registerMemberForCard(uid, {
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mendaftar. Coba lagi." };
  }
  revalidatePath(`/q/${uid}`);
  return { success: true };
}

export async function redeemPointsAction(uid: string, memberId: string, points: number): Promise<ActionResult> {
  try {
    await redeemPoints(memberId, points);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menukar poin." };
  }
  revalidatePath(`/q/${uid}`);
  return { success: true };
}
