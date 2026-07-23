"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createKpiGoal, KPI_SCOPES, updateVisibleKpiProgress, type KpiScope } from "@/server/services/kpi-goal-service";

export type KpiActionResult = { succeeded: boolean; message?: string };

export async function createKpiGoalAction(input: {
  title: string;
  weight: number;
  targetValue: number;
  scope: string;
  workerId?: string;
  department?: string;
}): Promise<KpiActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const scope = input.scope as KpiScope;
  if (!KPI_SCOPES.includes(scope)) return { succeeded: false, message: "Jenis target KPI tidak valid." };
  if (!input.title.trim()) return { succeeded: false, message: "Nama KPI wajib diisi." };
  if (!Number.isFinite(input.weight) || input.weight <= 0 || input.weight > 100) {
    return { succeeded: false, message: "Bobot harus di antara 1 sampai 100 persen." };
  }
  if (!Number.isFinite(input.targetValue) || input.targetValue <= 0) {
    return { succeeded: false, message: "Target harus lebih dari nol." };
  }

  try {
    await createKpiGoal(user, { ...input, scope, weight: input.weight / 100 });
    revalidatePath("/hris");
    revalidatePath("/hris/kpi");
    return { succeeded: true };
  } catch (error) {
    return { succeeded: false, message: error instanceof Error ? error.message : "Gagal membuat KPI." };
  }
}

export async function updateKpiProgressAction(goalId: string, actualValue: number): Promise<KpiActionResult> {
  const user = await requireRole(["OWNER", "MANAGER"]);
  if (!Number.isFinite(actualValue) || actualValue < 0) {
    return { succeeded: false, message: "Realisasi harus berupa angka nol atau lebih." };
  }

  try {
    await updateVisibleKpiProgress(user, goalId, actualValue);
    revalidatePath("/hris/kpi");
    return { succeeded: true };
  } catch (error) {
    return { succeeded: false, message: error instanceof Error ? error.message : "Gagal memperbarui progres KPI." };
  }
}
