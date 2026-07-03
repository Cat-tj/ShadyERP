import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import type { Plan } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

async function getTenantPlan(tenantId: string): Promise<Plan> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } });
  if (!tenant) throw new Error("Tenant tidak ditemukan.");
  return tenant.plan;
}

export async function assertCanAddOutlet(tenantId: string) {
  const plan = await getTenantPlan(tenantId);
  const limit = PLAN_LIMITS[plan].maxOutlets;
  if (limit === Infinity) return;
  const count = await prisma.outlet.count({ where: { tenantId } });
  if (count >= limit) {
    throw new Error(
      `Paket ${PLAN_LIMITS[plan].label} maksimal ${limit} outlet. Upgrade paket dulu di Pengaturan > Langganan.`
    );
  }
}

export async function assertCanAddUser(tenantId: string) {
  const plan = await getTenantPlan(tenantId);
  const limit = PLAN_LIMITS[plan].maxUsers;
  if (limit === Infinity) return;
  const count = await prisma.user.count({ where: { tenantId } });
  if (count >= limit) {
    throw new Error(
      `Paket ${PLAN_LIMITS[plan].label} maksimal ${limit} karyawan. Upgrade paket dulu di Pengaturan > Langganan.`
    );
  }
}

export async function assertCanAddProduct(tenantId: string) {
  const plan = await getTenantPlan(tenantId);
  const limit = PLAN_LIMITS[plan].maxProducts;
  if (limit === Infinity) return;
  const count = await prisma.product.count({ where: { tenantId } });
  if (count >= limit) {
    throw new Error(
      `Paket ${PLAN_LIMITS[plan].label} maksimal ${limit} produk. Upgrade paket dulu di Pengaturan > Langganan.`
    );
  }
}

export async function getUsageForTenant(tenantId: string) {
  const [outletCount, userCount, productCount, tenant] = await Promise.all([
    prisma.outlet.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
  ]);
  return { outletCount, userCount, productCount, plan: tenant.plan };
}

export async function getPendingRequestForTenant(tenantId: string) {
  return prisma.subscriptionRequest.findFirst({
    where: { tenantId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function requestUpgrade(tenantId: string, requestedPlan: Plan, note?: string) {
  const existing = await getPendingRequestForTenant(tenantId);
  if (existing) {
    throw new Error("Kamu masih punya permintaan upgrade yang sedang diproses.");
  }
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  if (tenant.plan === requestedPlan) {
    throw new Error("Kamu sudah berada di paket ini.");
  }
  return prisma.subscriptionRequest.create({
    data: { tenantId, requestedPlan, note: note?.trim() || null },
  });
}

export async function listSubscriptionHistory(tenantId: string) {
  return prisma.subscriptionRequest.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}
