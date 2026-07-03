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

export async function listTenantsForSuperAdmin() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { outlets: true, users: true } },
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
  }));
}

export async function setTenantActiveBySuperAdmin(tenantId: string, isActive: boolean) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant tidak ditemukan.");
  return prisma.tenant.update({ where: { id: tenantId }, data: { isActive } });
}
