import { prisma } from "@/lib/prisma";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I biar gak ketuker pas dibaca manual

function randomCodeSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

async function generateUniqueGiftCardCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `GC-${randomCodeSegment(4)}-${randomCodeSegment(4)}`;
    const existing = await prisma.giftCard.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Gagal membuat kode voucher unik, coba lagi.");
}

export async function sellGiftCard(input: {
  tenantId: string;
  amount: number;
  buyerName?: string;
  buyerPhone?: string;
  note?: string;
  soldById: string;
}) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Nilai voucher harus lebih dari 0.");
  }
  const code = await generateUniqueGiftCardCode();

  return prisma.$transaction(async (tx) => {
    const giftCard = await tx.giftCard.create({
      data: {
        tenantId: input.tenantId,
        code,
        initialValue: input.amount,
        balance: input.amount,
        buyerName: input.buyerName?.trim() || null,
        buyerPhone: input.buyerPhone?.trim() || null,
        note: input.note?.trim() || null,
        soldById: input.soldById,
      },
    });
    await tx.giftCardTransaction.create({
      data: {
        tenantId: input.tenantId,
        giftCardId: giftCard.id,
        type: "SALE",
        amount: input.amount,
        note: `Voucher dijual senilai ${input.amount}`,
      },
    });
    return giftCard;
  });
}

export async function getGiftCardByCode(tenantId: string, code: string) {
  return prisma.giftCard.findFirst({
    where: { tenantId, code: code.trim().toUpperCase() },
  });
}

export async function listGiftCards(tenantId: string, take = 50) {
  return prisma.giftCard.findMany({
    where: { tenantId },
    include: { soldBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function voidGiftCard(tenantId: string, giftCardId: string, reason: string, changedById: string) {
  return prisma.$transaction(async (tx) => {
    const giftCard = await tx.giftCard.findFirst({ where: { id: giftCardId, tenantId } });
    if (!giftCard) throw new Error("Voucher tidak ditemukan.");
    if (giftCard.status === "VOIDED") throw new Error("Voucher ini sudah dibatalkan sebelumnya.");

    const remainingBalance = giftCard.balance;
    await tx.giftCard.update({
      where: { id: giftCard.id },
      data: { status: "VOIDED", balance: 0 },
    });
    if (remainingBalance > 0) {
      await tx.giftCardTransaction.create({
        data: {
          tenantId,
          giftCardId: giftCard.id,
          type: "ADJUST",
          amount: -remainingBalance,
          note: `Voucher dibatalkan oleh ${changedById}: ${reason}`,
        },
      });
    }
    return giftCard;
  });
}
