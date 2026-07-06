import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * PERINGATAN: file ini SENGAJA TIDAK memfilter tenantId — dipakai super-admin
 * platform untuk melihat/mengelola SEMUA tenant. Jangan pernah expose fungsi
 * di file ini lewat Server Action yang dipanggil dari halaman tenant biasa;
 * hanya boleh dipanggil dari halaman di bawah /superadmin yang sudah dijaga
 * requireSuperAdmin().
 */

export async function verifySuperAdminCredentials(email: string, password: string) {
  const admin = await prisma.superAdmin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return admin;
}

export async function listSuperAdmins() {
  return prisma.superAdmin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

export async function createSuperAdminAccount(input: { email: string; name: string; password: string }) {
  const email = input.email.toLowerCase().trim();
  const name = input.name.trim() || "Super Admin";
  if (!email) throw new Error("Email superadmin wajib diisi.");
  if (input.password.length < 8) throw new Error("Password superadmin minimal 8 karakter.");

  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.superAdmin.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

export async function changeSuperAdminPassword(superAdminId: string, password: string) {
  if (password.length < 8) throw new Error("Password superadmin minimal 8 karakter.");
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.superAdmin.update({
    where: { id: superAdminId },
    data: { passwordHash },
    select: { id: true, email: true, name: true },
  });
}

export async function listTenantsForSuperAdmin() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { outlets: true, users: true } },
      setting: true,
    },
  });

  const tenantIds = tenants.map((t) => t.id);
  const salesByTenant = await prisma.sale.groupBy({
    by: ["tenantId"],
    where: { tenantId: { in: tenantIds }, status: "COMPLETED" },
    _sum: { total: true },
  });
  const omzetMap = new Map(salesByTenant.map((s) => [s.tenantId, s._sum.total ?? 0]));

  return tenants.map((tenant) => ({
    ...tenant,
    outletCount: tenant._count.outlets,
    userCount: tenant._count.users,
    totalOmzet: omzetMap.get(tenant.id) ?? 0,
    accountingMode: tenant.setting?.accountingMode ?? "SIMPLE",
  }));
}

export async function setTenantActiveBySuperAdmin(tenantId: string, isActive: boolean) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant tidak ditemukan.");
  return prisma.tenant.update({ where: { id: tenantId }, data: { isActive } });
}

export async function listPendingSubscriptionRequests() {
  return prisma.subscriptionRequest.findMany({
    where: { status: "PENDING" },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function reviewSubscriptionRequest(
  requestId: string,
  approve: boolean,
  reviewNote?: string
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.subscriptionRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error("Permintaan tidak ditemukan.");
    if (request.status !== "PENDING") throw new Error("Permintaan ini sudah diproses.");

    await tx.subscriptionRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? "APPROVED" : "REJECTED",
        reviewNote: reviewNote?.trim() || null,
        reviewedAt: new Date(),
      },
    });

    if (approve) {
      await tx.tenant.update({
        where: { id: request.tenantId },
        data: { plan: request.requestedPlan, isActive: true },
      });
    }
  });
}

export async function getPlatformStats() {
  const [totalTenants, activeTenants, planCounts, businessTypeCounts, totalOmzet30d] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.tenant.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.tenant.groupBy({ by: ["businessType"], _count: { businessType: true } }),
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await prisma.sale.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: since } },
        _sum: { total: true },
      });
      return result._sum.total ?? 0;
    })(),
  ]);

  return {
    totalTenants,
    activeTenants,
    inactiveTenants: totalTenants - activeTenants,
    planDistribution: Object.fromEntries(planCounts.map((p) => [p.plan, p._count.plan])) as Record<string, number>,
    businessTypeDistribution: Object.fromEntries(businessTypeCounts.map((b) => [b.businessType, b._count.businessType])) as Record<string, number>,
    totalOmzet30d,
  };
}

export async function changeTenantPlan(tenantId: string, plan: "FREE" | "BASIC" | "PRO") {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant tidak ditemukan.");
  return prisma.tenant.update({ where: { id: tenantId }, data: { plan } });
}

export async function changeTenantAccountingMode(tenantId: string, mode: "SIMPLE" | "ADVANCED") {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant tidak ditemukan.");
  return prisma.tenantSetting.upsert({
    where: { tenantId },
    update: { accountingMode: mode },
    create: { tenantId, accountingMode: mode },
  });
}

export async function getTenantDetailForSuperAdmin(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      _count: { select: { outlets: true, users: true, products: true } },
      setting: true,
      subscriptionRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!tenant) throw new Error("Tenant tidak ditemukan.");

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const omzet30d = await prisma.sale.aggregate({
    where: { tenantId, status: "COMPLETED", createdAt: { gte: since30d } },
    _sum: { total: true },
  });

  return {
    ...tenant,
    outletCount: tenant._count.outlets,
    userCount: tenant._count.users,
    productCount: tenant._count.products,
    accountingMode: tenant.setting?.accountingMode ?? "SIMPLE",
    omzet30d: omzet30d._sum.total ?? 0,
  };
}
