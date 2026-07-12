"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/require-session";
import {
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  findConflictingBooking,
  type BookingInput,
} from "@/server/services/booking-service";
import { listUsers } from "@/server/services/user-service";
import type { BookingStatus } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean; warning?: string };

export type BookingFormInput = Omit<BookingInput, "scheduledAt"> & { scheduledAt: string };

async function buildConflictWarning(
  tenantId: string,
  input: BookingFormInput,
  scheduledAt: Date,
  excludeBookingId?: string
): Promise<string | undefined> {
  const conflict = await findConflictingBooking(
    tenantId,
    input.staffUserId,
    scheduledAt,
    input.durationMinutes,
    excludeBookingId
  );
  if (!conflict) return undefined;
  const staff = input.staffUserId ? (await listUsers(tenantId)).find((u) => u.id === input.staffUserId) : null;
  const conflictTime = conflict.scheduledAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `Jadwal bentrok: ${staff?.name ?? "Staff ini"} udah ada booking "${conflict.serviceName}" jam ${conflictTime} — tetap tersimpan, cek lagi jadwalnya.`;
}

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
  const warning = await buildConflictWarning(user.tenantId, input, scheduledAt);
  return { success: true, warning };
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
  const warning = await buildConflictWarning(user.tenantId, input, scheduledAt, id);
  return { success: true, warning };
}

export async function updateBookingStatusAction(id: string, status: BookingStatus): Promise<ActionResult> {
  const user = await requireSession();
  try {
    await updateBookingStatus(user.tenantId, id, status, user.id);
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
