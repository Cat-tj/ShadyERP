import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";
import { findMemberByPhone } from "@/server/services/member-service";
import { formatRupiah } from "@/lib/format";
import type { LaundryOrderStatus, LaundryServiceType, PaymentMethod } from "@prisma/client";

export type LaundryOrderInput = {
  outletId: string;
  customerName: string;
  customerPhone: string | null;
  laundryServiceId: string | null;
  serviceType: LaundryServiceType;
  weightGram: number | null;
  itemQty: number | null;
  pricePerKg: number | null;
  servicePrice: number;
  extraFee: number;
  discountAmount: number;
  paidAmount: number;
  dueAt: Date | null;
  pickupDelivery: boolean;
  deliveryAddress: string | null;
  note: string | null;
};

export type LaundryServiceInput = {
  name: string;
  serviceType: LaundryServiceType;
  pricePerKg: number | null;
  servicePrice: number;
  isActive: boolean;
};

export function isWeightLaundryType(serviceType: LaundryServiceType) {
  return serviceType === "KILOAN" || serviceType === "EXPRESS";
}

function calculateTotal(input: LaundryOrderInput) {
  const kiloTotal =
    isWeightLaundryType(input.serviceType)
      ? Math.round(((input.weightGram ?? 0) / 1000) * (input.pricePerKg ?? 0))
      : 0;
  const itemTotal = !isWeightLaundryType(input.serviceType)
    ? input.servicePrice * (input.itemQty ?? 1)
    : input.servicePrice;
  return Math.max(0, kiloTotal + itemTotal + input.extraFee - input.discountAmount);
}

function validateLaundryInput(input: LaundryOrderInput) {
  if (!input.customerName.trim()) throw new Error("Nama pelanggan wajib diisi.");
  if (input.pickupDelivery && !input.deliveryAddress?.trim()) {
    throw new Error("Alamat pickup/delivery wajib diisi.");
  }
  if ((input.weightGram ?? 0) < 0 || (input.itemQty ?? 0) < 0) throw new Error("Jumlah laundry tidak valid.");
  if ([input.pricePerKg, input.servicePrice, input.extraFee, input.discountAmount, input.paidAmount].some((v) => (v ?? 0) < 0)) {
    throw new Error("Nominal laundry tidak valid.");
  }
}

export async function listLaundryOrders(tenantId: string, outletIds: string[], take = 80) {
  return prisma.laundryOrder.findMany({
    where: { tenantId, outletId: { in: outletIds } },
    include: { outlet: true, createdBy: { select: { name: true } }, member: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take,
  });
}

export async function listLaundryServices(tenantId: string, options?: { includeInactive?: boolean }) {
  return prisma.laundryService.findMany({
    where: { tenantId, ...(options?.includeInactive ? {} : { isActive: true }) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function ensureDefaultLaundryServices(tenantId: string) {
  const count = await prisma.laundryService.count({ where: { tenantId } });
  if (count > 0) return;

  await prisma.laundryService.createMany({
    data: [
      { tenantId, name: "Kiloan", serviceType: "KILOAN", pricePerKg: 8000, sortOrder: 10 },
      { tenantId, name: "Express", serviceType: "EXPRESS", pricePerKg: 12000, sortOrder: 20 },
      { tenantId, name: "Satuan", serviceType: "SATUAN", servicePrice: 10000, sortOrder: 30 },
      { tenantId, name: "Dry clean", serviceType: "DRY_CLEAN", servicePrice: 25000, sortOrder: 40 },
      { tenantId, name: "Setrika", serviceType: "SETRIKA", servicePrice: 7000, sortOrder: 50 },
    ],
  });
}

export async function upsertLaundryService(
  tenantId: string,
  input: LaundryServiceInput & { id?: string | null }
) {
  const name = input.name.trim();
  if (!name) throw new Error("Nama layanan wajib diisi.");
  if ((input.pricePerKg ?? 0) < 0 || input.servicePrice < 0) {
    throw new Error("Harga layanan tidak valid.");
  }

  if (input.id) {
    const existing = await prisma.laundryService.findFirst({ where: { id: input.id, tenantId } });
    if (!existing) throw new Error("Layanan laundry tidak ditemukan.");
    return prisma.laundryService.update({
      where: { id: input.id },
      data: {
        name,
        serviceType: input.serviceType,
        pricePerKg: isWeightLaundryType(input.serviceType) ? input.pricePerKg : null,
        servicePrice: input.servicePrice,
        isActive: input.isActive,
      },
    });
  }

  const last = await prisma.laundryService.aggregate({
    where: { tenantId },
    _max: { sortOrder: true },
  });
  return prisma.laundryService.create({
    data: {
      tenantId,
      name,
      serviceType: input.serviceType,
      pricePerKg: isWeightLaundryType(input.serviceType) ? input.pricePerKg : null,
      servicePrice: input.servicePrice,
      isActive: input.isActive,
      sortOrder: (last._max.sortOrder ?? 0) + 10,
    },
  });
}

export async function toggleLaundryService(tenantId: string, id: string, isActive: boolean) {
  const existing = await prisma.laundryService.findFirst({ where: { id, tenantId } });
  if (!existing) throw new Error("Layanan laundry tidak ditemukan.");
  return prisma.laundryService.update({ where: { id }, data: { isActive } });
}

export async function createLaundryOrder(
  tenantId: string,
  createdById: string,
  input: LaundryOrderInput
) {
  validateLaundryInput(input);
  const outlet = await prisma.outlet.findFirst({ where: { id: input.outletId, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");

  const service = input.laundryServiceId
    ? await prisma.laundryService.findFirst({
        where: { id: input.laundryServiceId, tenantId, isActive: true },
      })
    : null;
  if (input.laundryServiceId && !service) throw new Error("Jenis layanan laundry tidak ditemukan.");
  const serviceType = service?.serviceType ?? input.serviceType;
  const orderInput = { ...input, serviceType };
  const matchedMember = input.customerPhone?.trim()
    ? await findMemberByPhone(tenantId, input.customerPhone)
    : null;

  return prisma.$transaction(async (tx) => {
    const order = await tx.laundryOrder.create({
      data: {
        tenantId,
        outletId: input.outletId,
        laundryServiceId: service?.id ?? null,
        memberId: matchedMember?.id ?? null,
        orderNumber: `LDY-${ulid()}`,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone?.trim() || null,
        serviceType,
        serviceName: service?.name ?? null,
        weightGram: input.weightGram,
        itemQty: input.itemQty,
        pricePerKg: input.pricePerKg,
        servicePrice: input.servicePrice,
        extraFee: input.extraFee,
        discountAmount: input.discountAmount,
        total: calculateTotal(orderInput),
        paidAmount: input.paidAmount,
        dueAt: input.dueAt,
        pickupDelivery: input.pickupDelivery,
        deliveryAddress: input.deliveryAddress?.trim() || null,
        note: input.note?.trim() || null,
        createdById,
      },
    });

    // Dibayar di muka (DP) saat order dibuat — tetap dicatat sebagai baris
    // pembayaran pertama, biar histori cicilannya lengkap dari awal.
    if (input.paidAmount > 0) {
      await tx.laundryPayment.create({
        data: {
          tenantId,
          laundryOrderId: order.id,
          amount: input.paidAmount,
          method: "CASH",
          note: "DP saat order dibuat",
        },
      });
    }

    return order;
  });
}

/** Rincian cicilan/DP/pelunasan satu order laundry, terbaru duluan. */
export async function listLaundryPayments(tenantId: string, laundryOrderId: string) {
  return prisma.laundryPayment.findMany({
    where: { tenantId, laundryOrderId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Catat satu cicilan/pelunasan laundry — nambah baris LaundryPayment sekaligus
 * naikkan LaundryOrder.paidAmount (dipakai sebagai cache biar gak perlu SUM
 * tiap render daftar order). Gak boleh sampai lebih dari total tagihan.
 */
export async function addLaundryPayment(
  tenantId: string,
  laundryOrderId: string,
  amount: number,
  method: PaymentMethod,
  note?: string | null
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Jumlah pembayaran harus lebih dari 0.");
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.laundryOrder.findFirst({ where: { id: laundryOrderId, tenantId } });
    if (!order) throw new Error("Order laundry tidak ditemukan.");
    const remaining = order.total - order.paidAmount;
    if (amount > remaining) {
      throw new Error(`Sisa tagihan cuma ${formatRupiah(remaining)} — jumlah bayar kelebihan.`);
    }

    await tx.laundryPayment.create({
      data: { tenantId, laundryOrderId, amount, method, note: note?.trim() || null },
    });

    return tx.laundryOrder.update({
      where: { id: laundryOrderId },
      data: { paidAmount: { increment: amount } },
    });
  });
}

export async function updateLaundryStatus(
  tenantId: string,
  id: string,
  status: LaundryOrderStatus
) {
  const order = await prisma.laundryOrder.findFirst({ where: { id, tenantId } });
  if (!order) throw new Error("Order laundry tidak ditemukan.");

  // Poin dikasih sekali aja seumur order (ditandai `pointsAwarded`) — kalau cuma dijaga dari
  // status sebelumnya, staff toggle PICKED_UP -> READY -> PICKED_UP bisa dapat poin dobel.
  if (status === "PICKED_UP" && !order.pointsAwarded && order.memberId) {
    const setting = await prisma.tenantSetting.findUnique({ where: { tenantId } });
    const points = Math.floor(order.total / (setting?.pointsPerAmount ?? 10000));
    if (points > 0) {
      await prisma.$transaction([
        prisma.pointTransaction.create({
          data: {
            tenantId,
            memberId: order.memberId,
            type: "EARN",
            points,
            note: `Poin dari laundry ${order.orderNumber}`,
          },
        }),
        prisma.member.update({
          where: { id: order.memberId },
          data: { points: { increment: points } },
        }),
      ]);
    }
    return prisma.laundryOrder.update({ where: { id }, data: { status, pointsAwarded: true } });
  }

  return prisma.laundryOrder.update({ where: { id }, data: { status } });
}

/**
 * Lookup publik (tanpa login) buat pelanggan cek status cucian sendiri —
 * `orderNumber` pakai ULID jadi sudah unik & tidak bisa ditebak sendirian,
 * tapi tetap dicocokkan ke `customerPhone` (kalau ada) supaya orang lain
 * yang kebetulan tahu nomor order gak bisa intip data pelanggan lain.
 */
export async function getPublicLaundryOrderStatus(orderNumber: string, phone: string) {
  const trimmedOrderNumber = orderNumber.trim();
  const trimmedPhone = phone.trim();
  if (!trimmedOrderNumber || !trimmedPhone) return null;

  const order = await prisma.laundryOrder.findUnique({
    where: { orderNumber: trimmedOrderNumber },
    include: { outlet: true },
  });
  if (!order) return null;
  if (order.customerPhone && order.customerPhone !== trimmedPhone) return null;

  return order;
}
