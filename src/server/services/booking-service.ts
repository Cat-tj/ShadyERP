import { prisma } from "@/lib/prisma";
import type { BookingType, BookingStatus, PaymentMethod, OrderType } from "@prisma/client";
import { buildInvoiceNumber, buildInvoicePrefix } from "@/lib/invoice";
import { logSaleToJournal } from "@/server/services/accounting-service";
import { findMemberByPhone } from "@/server/services/member-service";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 *
 * Booking dicatat staff (mis. lewat telepon) — belum ada halaman publik untuk
 * pelanggan booking sendiri. Ada deteksi bentrok jadwal per staff (lihat
 * findConflictingBooking) tapi sifatnya cuma peringatan, bukan blokir — staff
 * yang putuskan mau tetap lanjut atau ganti jadwal.
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
  pax?: number | null;
  eventAddress?: string | null;
  quotedAmount?: number | null;
  transportFee?: number;
  staffFee?: number;
  depositAmount?: number;
  note: string | null;
};

function validateBookingMoney(input: BookingInput) {
  const amounts = [input.quotedAmount, input.transportFee, input.staffFee, input.depositAmount];
  if (amounts.some((amount) => amount !== null && amount !== undefined && amount < 0)) {
    throw new Error("Nominal booking tidak valid.");
  }
  if (input.pax !== null && input.pax !== undefined && input.pax < 0) {
    throw new Error("Jumlah pax tidak valid.");
  }
}

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
    include: { outlet: true, staff: true, member: { select: { name: true } } },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createBooking(tenantId: string, input: BookingInput) {
  if (!input.customerName.trim()) throw new Error("Nama pelanggan wajib diisi.");
  if (!input.serviceName.trim()) throw new Error("Nama layanan/pesanan wajib diisi.");
  validateBookingMoney(input);
  const matchedMember = input.customerPhone?.trim()
    ? await findMemberByPhone(tenantId, input.customerPhone)
    : null;
  return prisma.booking.create({
    data: {
      tenantId,
      outletId: input.outletId,
      type: input.type,
      memberId: matchedMember?.id ?? null,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone?.trim() || null,
      serviceName: input.serviceName.trim(),
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      staffUserId: input.staffUserId,
      pax: input.pax ?? null,
      eventAddress: input.eventAddress?.trim() || null,
      quotedAmount: input.quotedAmount ?? null,
      transportFee: input.transportFee ?? 0,
      staffFee: input.staffFee ?? 0,
      depositAmount: input.depositAmount ?? 0,
      note: input.note?.trim() || null,
    },
  });
}

export async function updateBooking(tenantId: string, id: string, input: BookingInput) {
  const booking = await prisma.booking.findFirst({ where: { id, tenantId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");
  if (!input.customerName.trim()) throw new Error("Nama pelanggan wajib diisi.");
  if (!input.serviceName.trim()) throw new Error("Nama layanan/pesanan wajib diisi.");
  validateBookingMoney(input);
  const matchedMember = input.customerPhone?.trim()
    ? await findMemberByPhone(tenantId, input.customerPhone)
    : null;
  return prisma.booking.update({
    where: { id },
    data: {
      outletId: input.outletId,
      type: input.type,
      memberId: matchedMember?.id ?? null,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone?.trim() || null,
      serviceName: input.serviceName.trim(),
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      staffUserId: input.staffUserId,
      pax: input.pax ?? null,
      eventAddress: input.eventAddress?.trim() || null,
      quotedAmount: input.quotedAmount ?? null,
      transportFee: input.transportFee ?? 0,
      staffFee: input.staffFee ?? 0,
      depositAmount: input.depositAmount ?? 0,
      note: input.note?.trim() || null,
    },
  });
}

export async function updateBookingStatus(
  tenantId: string,
  id: string,
  status: BookingStatus,
  cashierId?: string
) {
  const booking = await prisma.booking.findFirst({ where: { id, tenantId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");

  if (status === "DONE") {
    const existingSale = await prisma.sale.findFirst({
      where: { tenantId, bookingId: id },
    });

    if (!existingSale && booking.quotedAmount && booking.quotedAmount > 0) {
      let product = await prisma.product.findFirst({
        where: { tenantId, name: "Layanan Event/Booking" },
      });
      if (!product) {
        product = await prisma.product.create({
          data: {
            tenantId,
            name: "Layanan Event/Booking",
            price: 0,
            cost: 0,
            trackStock: false,
            isActive: true,
            kind: "SERVICE",
          },
        });
      }

      const activeCashierId = cashierId || booking.staffUserId || (await prisma.user.findFirst({ where: { tenantId } }))?.id;
      if (!activeCashierId) throw new Error("Tidak ada staf/kasir yang valid untuk memposting transaksi.");

      const today = new Date();
      const ymdPrefix = buildInvoicePrefix(booking.outletId, today);
      const countToday = await prisma.sale.count({
        where: { tenantId, outletId: booking.outletId, invoiceNumber: { startsWith: ymdPrefix } },
      });
      const invoiceNumber = buildInvoiceNumber(booking.outletId, today, countToday + 1);

      await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            tenantId,
            outletId: booking.outletId,
            cashierId: activeCashierId,
            memberId: booking.memberId,
            invoiceNumber,
            subtotal: booking.quotedAmount || 0,
            discountAmount: 0,
            taxAmount: 0,
            total: booking.quotedAmount || 0,
            paymentMethod: "CASH" as PaymentMethod,
            amountPaid: booking.quotedAmount || 0,
            changeAmount: 0,
            orderType: "TAKEAWAY" as OrderType,
            status: "COMPLETED",
            bookingId: id,
            items: {
              create: [
                {
                  tenantId,
                  productId: product.id,
                  productName: booking.serviceName || "Layanan Booking/Event",
                  variantLabel: null,
                  price: booking.quotedAmount || 0,
                  qty: 1,
                  discountAmount: 0,
                  subtotal: booking.quotedAmount || 0,
                },
              ],
            },
          },
        });

        await logSaleToJournal(tenantId, sale.id, tx);

        if (booking.memberId) {
          const setting = await tx.tenantSetting.findUnique({ where: { tenantId } });
          const points = Math.floor((booking.quotedAmount || 0) / (setting?.pointsPerAmount ?? 10000));
          if (points > 0) {
            await tx.pointTransaction.create({
              data: {
                tenantId,
                memberId: booking.memberId,
                type: "EARN",
                points,
                saleId: sale.id,
                note: `Poin dari booking ${booking.serviceName}`,
              },
            });
            await tx.member.update({
              where: { id: booking.memberId },
              data: { points: { increment: points } },
            });
          }
        }
      });
    }
  }

  return prisma.booking.update({ where: { id }, data: { status } });
}

export async function deleteBooking(tenantId: string, id: string) {
  const booking = await prisma.booking.findFirst({ where: { id, tenantId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");
  return prisma.booking.delete({ where: { id } });
}

/**
 * Cek apakah ada booking lain di staff yang sama dengan jadwal yang tumpang tindih —
 * cuma dipakai buat kasih peringatan (bukan blokir), staff yang putuskan mau tetap lanjut.
 */
export async function findConflictingBooking(
  tenantId: string,
  staffUserId: string | null,
  scheduledAt: Date,
  durationMinutes: number,
  excludeBookingId?: string
) {
  if (!staffUserId) return null;

  const newStart = scheduledAt;
  const newEnd = new Date(scheduledAt.getTime() + durationMinutes * 60_000);

  const candidates = await prisma.booking.findMany({
    where: {
      tenantId,
      staffUserId,
      status: { in: ["PENDING", "CONFIRMED"] },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      // Pre-filter kasar biar gak scan semua booking — jadwal yang mungkin overlap
      // pasti mulai dalam rentang durasi terpanjang yang masuk akal (1 hari).
      scheduledAt: {
        gte: new Date(newStart.getTime() - 24 * 60 * 60_000),
        lte: newEnd,
      },
    },
  });

  return (
    candidates.find((b) => {
      const bStart = b.scheduledAt;
      const bEnd = new Date(b.scheduledAt.getTime() + b.durationMinutes * 60_000);
      return newStart < bEnd && bStart < newEnd;
    }) ?? null
  );
}
