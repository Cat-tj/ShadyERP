"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/server/require-session";
import {
  createLaundryOrder,
  toggleLaundryService,
  updateLaundryStatus,
  upsertLaundryService,
  addLaundryPayment,
  type LaundryOrderInput,
  type LaundryServiceInput,
} from "@/server/services/laundry-service";
import type { LaundryOrderStatus, PaymentMethod } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export async function createLaundryOrderAction(input: LaundryOrderInput): Promise<ActionResult> {
  const user = await requireModule("laundry");
  try {
    await createLaundryOrder(user.tenantId, user.id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal membuat order laundry." };
  }
  revalidatePath("/laundry");
  return { success: true };
}

export async function updateLaundryStatusAction(
  id: string,
  status: LaundryOrderStatus
): Promise<ActionResult> {
  const user = await requireModule("laundry");
  try {
    await updateLaundryStatus(user.tenantId, id, status);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status laundry." };
  }
  revalidatePath("/laundry");
  return { success: true };
}

export async function addLaundryPaymentAction(
  laundryOrderId: string,
  amount: number,
  method: PaymentMethod
): Promise<ActionResult> {
  const user = await requireModule("laundry");
  try {
    await addLaundryPayment(user.tenantId, laundryOrderId, amount, method);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mencatat pembayaran laundry." };
  }
  revalidatePath("/laundry");
  return { success: true };
}

export async function upsertLaundryServiceAction(
  input: LaundryServiceInput & { id?: string | null }
): Promise<ActionResult> {
  const user = await requireModule("laundry");
  try {
    await upsertLaundryService(user.tenantId, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan layanan laundry." };
  }
  revalidatePath("/laundry");
  revalidatePath("/pengaturan/laundry");
  return { success: true };
}

export async function toggleLaundryServiceAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const user = await requireModule("laundry");
  try {
    await toggleLaundryService(user.tenantId, id, isActive);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah layanan laundry." };
  }
  revalidatePath("/laundry");
  revalidatePath("/pengaturan/laundry");
  return { success: true };
}
