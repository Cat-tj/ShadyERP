import { prisma } from "@/lib/prisma";
import { REDEEM_RATE_RUPIAH_PER_POINT } from "@/lib/loyalty";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */
export async function searchMembers(tenantId: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return prisma.member.findMany({
    where: {
      tenantId,
      OR: [
        { name: { contains: trimmed } },
        { phone: { contains: trimmed } },
      ],
    },
    take: 8,
    orderBy: { name: "asc" },
  });
}

export async function listMembers(tenantId: string, query?: string) {
  const trimmed = query?.trim();
  return prisma.member.findMany({
    where: {
      tenantId,
      ...(trimmed
        ? { OR: [{ name: { contains: trimmed } }, { phone: { contains: trimmed } }] }
        : {}),
    },
    include: { uidCard: true },
    orderBy: { joinedAt: "desc" },
    take: 100,
  });
}

export async function getMemberDetail(tenantId: string, memberId: string) {
  const member = await prisma.member.findFirst({
    where: { id: memberId, tenantId },
    include: { uidCard: true },
  });
  if (!member) return null;

  const [sales, pointTransactions] = await Promise.all([
    prisma.sale.findMany({
      where: { tenantId, memberId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.pointTransaction.findMany({
      where: { tenantId, memberId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return { member, sales, pointTransactions };
}

/** Dipakai halaman publik /q/[uid] — memberId sudah tervalidasi lewat kartu, tidak butuh tenantId dari luar. */
export async function getMemberPublicProfile(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return null;

  const sales = await prisma.sale.findMany({
    where: { memberId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { outlet: true },
  });

  return { member, sales };
}

export async function redeemPoints(memberId: string, points: number) {
  if (!Number.isFinite(points) || points <= 0) {
    throw new Error("Jumlah poin tidak valid.");
  }
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error("Member tidak ditemukan.");
  if (member.points < points) {
    throw new Error(`Poin tidak cukup. Poin kamu saat ini ${member.points}.`);
  }

  const depositAdded = points * REDEEM_RATE_RUPIAH_PER_POINT;

  return prisma.$transaction(async (tx) => {
    await tx.pointTransaction.create({
      data: {
        tenantId: member.tenantId,
        memberId: member.id,
        type: "REDEEM",
        points: -points,
        note: `Ditukar jadi saldo ${depositAdded}`,
      },
    });
    return tx.member.update({
      where: { id: member.id },
      data: { points: { decrement: points }, depositBalance: { increment: depositAdded } },
    });
  });
}
