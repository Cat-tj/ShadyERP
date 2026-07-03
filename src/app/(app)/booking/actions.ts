"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/require-session";
import {
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  type BookingInput,
} from "@/server/services/booking-service";
import type { BookingStatus } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export type BookingFormInput = Omit<BookingInput, "scheduledAt"> & { scheduledAt: string };

export async function createBookingAction(input: BookingFormInput): Promise<ActionResult> {
  const user = await requireSession();
  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return { error: "Tanggal/jam tidak valid." };
  try {
    await createBooking(user.tenantId, { ...input, scheduledAt });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menambah booking." };
  }
  revalidatePath("/booking");
  return { success: true };
}

export async function updateBookingAction(id: string, input: BookingFormInput): Promise<ActionResult> {
  const user = await requireSession();
  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return { error: "Tanggal/jam tidak valid." };
  try {
    await updateBooking(user.tenantId, id, { ...input, scheduledAt });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah booking." };
  }
  revalidatePath("/booking");
  return { success: true };
}

export async function updateBookingStatusAction(id: string, status: BookingStatus): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await updateBookingStatus(user.tenantId, id, status);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengubah status booking." };
  }
  revalidatePath("/booking");
  return { success: true };
}

export async function deleteBookingAction(id: string): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await deleteBooking(user.tenantId, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menghapus booking." };
  }
  revalidatePath("/booking");
  return { success: true };
}
