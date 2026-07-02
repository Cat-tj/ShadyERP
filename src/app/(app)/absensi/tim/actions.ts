"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createSchedule, deleteSchedule, type ScheduleInput } from "@/server/services/schedule-service";

export type ActionResult = { error?: string; success?: boolean };

export async function createScheduleAction(input: ScheduleInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await createSchedule(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah jadwal." };
  }
  revalidatePath("/absensi/tim");
  return { success: true };
}

export async function deleteScheduleAction(id: string): Promise<ActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  try {
    await deleteSchedule(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus jadwal." };
  }
  revalidatePath("/absensi/tim");
  return { success: true };
}
