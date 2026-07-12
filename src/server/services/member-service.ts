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

/** Cari member berdasarkan nomor HP persis — dipakai buat auto-link laundry/booking ke member yang sudah kedaftar. */
export async function findMemberByPhone(tenantId: string, phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  return prisma.member.findFirst({ where: { tenantId, phone: trimmed } });
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

export async function createQuickMember(
  tenantId: string,
  input: { name: string; phone: string }
) {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name) throw new Error("Nama wajib diisi.");
  if (!phone) throw new Error("Nomor HP wajib diisi.");

  const duplicate = await prisma.member.findFirst({ where: { tenantId, phone } });
  if (duplicate) {
    throw new Error("Nomor HP ini sudah terdaftar sebagai member.");
  }

  return prisma.member.create({
    data: { tenantId, name, phone },
  });
}

export async function updateMemberInfo(
  tenantId: string,
  memberId: string,
  input: { name: string; phone: string; email?: string | null }
) {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name) throw new Error("Nama wajib diisi.");
  if (!phone) throw new Error("Nomor HP wajib diisi.");

  const member = await prisma.member.findFirst({ where: { id: memberId, tenantId } });
  if (!member) throw new Error("Member tidak ditemukan.");

  const duplicate = await prisma.member.findFirst({
    where: { tenantId, phone, NOT: { id: memberId } },
  });
  if (duplicate) {
    throw new Error("Nomor HP ini sudah dipakai member lain.");
  }

  return prisma.member.update({
    where: { id: memberId },
    data: { name, phone, email: input.email?.trim() || null },
  });
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

/**
 * Produk yang paling sering dibeli member ini (dari riwayat transaksi COMPLETED),
 * diurutkan dari qty terbanyak — dipakai buat quick-add di kasir pas member dipilih.
 */
export async function getMemberFavoriteProducts(tenantId: string, memberId: string, limit = 6) {
  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { tenantId, sale: { memberId, status: "COMPLETED" } },
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { tenantId, id: { in: grouped.map((g) => g.productId) }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  return grouped
    .map((g) => productMap.get(g.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}
