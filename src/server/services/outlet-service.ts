import { prisma } from "@/lib/prisma";
import type { OutletType } from "@prisma/client";
import { assertCanAddOutlet } from "@/server/services/billing-service";
import { createExpense } from "@/server/services/expense-service";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */
export async function listOutletsForUser(
  tenantId: string,
  userId: string,
  role: "OWNER" | "MANAGER" | "STAFF"
) {
  if (role === "OWNER") {
    return prisma.outlet.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  return prisma.outlet.findMany({
    where: {
      tenantId,
      isActive: true,
      userOutlets: { some: { userId } },
    },
    orderBy: { name: "asc" },
  });
}

export async function listAllOutlets(tenantId: string) {
  return prisma.outlet.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export type OutletInput = {
  name: string;
  address: string | null;
  phone: string | null;
  receiptPaperWidth?: 58 | 80;
  outletType?: OutletType;
  /** Field event* cuma dipakai kalau outletType EVENT. */
  eventName?: string | null;
  eventStartDate?: Date | null;
  eventEndDate?: Date | null;
  /** Kalau diisi & outletType EVENT saat outlet BARU dibuat, otomatis dicatat sebagai Pengeluaran. */
  eventFee?: number | null;
};

export async function createOutlet(tenantId: string, createdById: string, input: OutletInput) {
  await assertCanAddOutlet(tenantId);
  const outletType = input.outletType ?? "PERMANENT";
  const outlet = await prisma.outlet.create({
    data: {
      tenantId,
      name: input.name,
      address: input.address,
      phone: input.phone,
      receiptPaperWidth: input.receiptPaperWidth ?? 58,
      outletType,
      eventName: outletType === "EVENT" ? input.eventName?.trim() || null : null,
      eventStartDate: outletType === "EVENT" ? input.eventStartDate ?? null : null,
      eventEndDate: outletType === "EVENT" ? input.eventEndDate ?? null : null,
      eventFee: outletType === "EVENT" ? input.eventFee ?? null : null,
    },
  });

  // Biaya event dicatat otomatis sebagai satu baris Pengeluaran begitu outlet-nya
  // dibuat — owner udah isi angkanya di form yang sama, jangan disuruh input dobel
  // di halaman Pengeluaran terpisah.
  if (outletType === "EVENT" && input.eventFee && input.eventFee > 0) {
    await createExpense(tenantId, createdById, {
      outletId: outlet.id,
      category: "EVENT",
      amount: input.eventFee,
      note: `Biaya event: ${input.eventName?.trim() || outlet.name}`,
      spentAt: input.eventStartDate ?? new Date(),
    });
  }

  return outlet;
}

export async function updateOutlet(tenantId: string, id: string, input: OutletInput) {
  const outlet = await prisma.outlet.findFirst({ where: { id, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");
  const outletType = input.outletType ?? outlet.outletType;
  return prisma.outlet.update({
    where: { id },
    data: {
      name: input.name,
      address: input.address,
      phone: input.phone,
      receiptPaperWidth: input.receiptPaperWidth ?? outlet.receiptPaperWidth,
      outletType,
      eventName: outletType === "EVENT" ? input.eventName?.trim() || null : null,
      eventStartDate: outletType === "EVENT" ? input.eventStartDate ?? null : null,
      eventEndDate: outletType === "EVENT" ? input.eventEndDate ?? null : null,
      eventFee: outletType === "EVENT" ? input.eventFee ?? null : null,
    },
  });
}

export async function setOutletActive(tenantId: string, id: string, isActive: boolean) {
  const outlet = await prisma.outlet.findFirst({ where: { id, tenantId } });
  if (!outlet) throw new Error("Outlet tidak ditemukan.");
  return prisma.outlet.update({ where: { id }, data: { isActive } });
}
