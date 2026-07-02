import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";
import type { UidCardType } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`,
 * KECUALI `getCardByUid` — itu memang sengaja publik (dipakai halaman /q/[uid]
 * yang diakses pelanggan tanpa login dan tanpa tahu tenant-nya).
 */

export async function listBatches(tenantId: string) {
  return prisma.uidBatch.findMany({
    where: { tenantId },
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateBatchInput = {
  cardType: UidCardType;
  quantity: number;
  serialPrefix: string;
};

export async function createBatch(tenantId: string, input: CreateBatchInput) {
  if (input.quantity < 1 || input.quantity > 500) {
    throw new Error("Jumlah kartu harus antara 1-500 per batch.");
  }
  const prefix = input.serialPrefix.trim().toUpperCase();
  if (!prefix) {
    throw new Error("Awalan nomor seri wajib diisi.");
  }

  const existingCount = await prisma.uidCard.count({
    where: { tenantId, serialNumber: { startsWith: `${prefix}-` } },
  });

  return prisma.$transaction(async (tx) => {
    const batch = await tx.uidBatch.create({
      data: { tenantId, cardType: input.cardType, quantity: input.quantity, serialPrefix: prefix },
    });

    const cards = Array.from({ length: input.quantity }, (_, i) => {
      const seq = existingCount + i + 1;
      return {
        tenantId,
        batchId: batch.id,
        uid: ulid(),
        serialNumber: `${prefix}-${String(seq).padStart(4, "0")}`,
        cardType: input.cardType,
        status: "UNASSIGNED" as const,
      };
    });

    await tx.uidCard.createMany({ data: cards });

    return tx.uidCard.findMany({ where: { batchId: batch.id }, orderBy: { serialNumber: "asc" } });
  });
}

export async function listCardsForBatch(tenantId: string, batchId: string) {
  return prisma.uidCard.findMany({
    where: { tenantId, batchId },
    orderBy: { serialNumber: "asc" },
  });
}

/**
 * Satu-satunya lookup yang boleh tanpa filter tenantId: dipakai halaman publik
 * /q/[uid] yang diakses pelanggan lewat scan QR, sebelum kita tahu tenant-nya.
 */
export async function getCardByUid(uid: string) {
  return prisma.uidCard.findUnique({
    where: { uid },
    include: { member: true },
  });
}

export async function registerMemberForCard(
  uid: string,
  input: { name: string; phone: string; email?: string | null }
) {
  const card = await prisma.uidCard.findUnique({ where: { uid } });
  if (!card) throw new Error("Kartu tidak ditemukan.");
  if (card.cardType !== "MEMBER") throw new Error("Kartu ini bukan kartu member.");
  if (card.status !== "UNASSIGNED") throw new Error("Kartu ini sudah aktif dipakai.");

  const existingPhone = await prisma.member.findUnique({
    where: { tenantId_phone: { tenantId: card.tenantId, phone: input.phone } },
  });
  if (existingPhone) {
    throw new Error("Nomor HP ini sudah terdaftar sebagai member. Hubungi kasir untuk bantuan.");
  }

  return prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        tenantId: card.tenantId,
        name: input.name,
        phone: input.phone,
        email: input.email || null,
      },
    });
    await tx.uidCard.update({
      where: { id: card.id },
      data: { memberId: member.id, status: "ACTIVE", activatedAt: new Date() },
    });
    return member;
  });
}

export async function assignCardToMember(tenantId: string, memberId: string, serialNumber: string) {
  const member = await prisma.member.findFirst({ where: { id: memberId, tenantId } });
  if (!member) throw new Error("Member tidak ditemukan.");

  const card = await prisma.uidCard.findFirst({
    where: { tenantId, serialNumber: serialNumber.trim().toUpperCase(), cardType: "MEMBER" },
  });
  if (!card) throw new Error("Kartu dengan nomor seri itu tidak ditemukan.");
  if (card.status !== "UNASSIGNED") throw new Error("Kartu ini sudah dipakai member lain.");

  return prisma.uidCard.update({
    where: { id: card.id },
    data: { memberId: member.id, status: "ACTIVE", activatedAt: new Date() },
  });
}
