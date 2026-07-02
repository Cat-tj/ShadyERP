"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createBatch, type CreateBatchInput } from "@/server/services/uid-card-service";

export type ActionResult = { error?: string; success?: boolean; batchId?: string };

export async function createBatchAction(input: CreateBatchInput): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  try {
    const cards = await createBatch(user.tenantId, input);
    revalidatePath("/pengaturan/kartu");
    return { success: true, batchId: cards[0]?.batchId ?? undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuat batch kartu." };
  }
}
