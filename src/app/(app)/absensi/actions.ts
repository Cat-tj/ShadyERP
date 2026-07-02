"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/require-session";
import { clockIn, clockOut } from "@/server/services/attendance-service";

export type ActionResult = { error?: string; success?: boolean };

export async function clockInAction(input: {
  outletId: string;
  photoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
}): Promise<ActionResult> {
  const user = await requireSession();
  if (!input.outletId) return { error: "Outlet belum dipilih." };

  try {
    await clockIn({
      tenantId: user.tenantId,
      userId: user.id,
      outletId: input.outletId,
      photoUrl: input.photoUrl,
      lat: input.lat,
      lng: input.lng,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal absen masuk." };
  }
  revalidatePath("/absensi");
  return { success: true };
}

export async function clockOutAction(): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await clockOut(user.tenantId, user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal absen pulang." };
  }
  revalidatePath("/absensi");
  return { success: true };
}
