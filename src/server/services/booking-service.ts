import { prisma } from "@/lib/prisma";
import type { BookingType, BookingStatus } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 *
 * Booking dicatat staff (mis. lewat telepon) — belum ada halaman publik untuk
 * pelanggan booking sendiri. Tidak ada deteksi bentrok jadwal otomatis; staff
 * cek manual dari daftar yang tampil.
 */

export type BookingInput = {
  outletId: string;
  type: BookingType;
  customerName: string;
  customerPhone: string | null;
  serviceName: string;
  scheduledAt: Date;
  durationMinutes: number;
  staffUserId: string | null;
  note: string | null;
};

export async function listBookings(
  tenantId: string,
  outletIds: string[],
  range: { from: Date; to: Date }
) {
  return prisma.booking.findMany({
    where: {
      tenantId,
      outletId: { in: outletIds },
      scheduledAt: { gte: range.from, lt: range.to },
    },
    include: { outlet: true, staff: true },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createBooking(tenantId: string, input: BookingInput) {
  if (!input.customerName.trim()) throw new Error("Nama pelanggan wajib diisi.");
  if (!input.serviceName.trim()) throw new Error("Nama layanan/pesanan wajib diisi.");
  return prisma.booking.create({
    data: {
      tenantId,
      outletId: input.outletId,
      type: input.type,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone?.trim() || null,
      serviceName: input.serviceName.trim(),
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      staffUserId: input.staffUserId,
      note: input.note?.trim() || null,
    },
  });
}

export async function updateBooking(tenantId: string, id: string, input: BookingInput) {
  const booking = await prisma.booking.findFirst({ where: { id, tenantId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");
  if (!input.customerName.trim()) throw new Error("Nama pelanggan wajib diisi.");
  if (!input.serviceName.trim()) throw new Error("Nama layanan/pesanan wajib diisi.");
  return prisma.booking.update({
    where: { id },
    data: {
      outletId: input.outletId,
      type: input.type,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone?.trim() || null,
      serviceName: input.serviceName.trim(),
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      staffUserId: input.staffUserId,
      note: input.note?.trim() || null,
    },
  });
}

export async function updateBookingStatus(tenantId: string, id: string, status: BookingStatus) {
  const booking = await prisma.booking.findFirst({ where: { id, tenantId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");
  return prisma.booking.update({ where: { id }, data: { status } });
}

export async function deleteBooking(tenantId: string, id: string) {
  const booking = await prisma.booking.findFirst({ where: { id, tenantId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");
  return prisma.booking.delete({ where: { id } });
}
