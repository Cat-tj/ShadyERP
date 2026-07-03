import { requireSuperAdmin } from "@/server/require-super-admin";
import { listTenantsForSuperAdmin } from "@/server/services/super-admin-service";
import { TenantListManager } from "@/components/superadmin/tenant-list-manager";

export default async function SuperAdminPage() {
  await requireSuperAdmin();
  const tenants = await listTenantsForSuperAdmin();

  return (
    <TenantListManager
      tenants={tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        businessType: tenant.businessType,
        plan: tenant.plan,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt.toISOString(),
        outletCount: tenant.outletCount,
        userCount: tenant.userCount,
        totalOmzet: tenant.totalOmzet,
      }))}
    />
  );
}
