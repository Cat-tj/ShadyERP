import { requireSuperAdmin } from "@/server/require-super-admin";
import {
  listTenantsForSuperAdmin,
  listPendingSubscriptionRequests,
} from "@/server/services/super-admin-service";
import { TenantListManager } from "@/components/superadmin/tenant-list-manager";
import { SubscriptionRequestsManager } from "@/components/superadmin/subscription-requests-manager";

export default async function SuperAdminPage() {
  await requireSuperAdmin();
  const [tenants, pendingRequests] = await Promise.all([
    listTenantsForSuperAdmin(),
    listPendingSubscriptionRequests(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {pendingRequests.length > 0 && (
        <SubscriptionRequestsManager
          requests={pendingRequests.map((req) => ({
            id: req.id,
            tenantName: req.tenant.name,
            currentPlan: req.tenant.plan,
            requestedPlan: req.requestedPlan,
            createdAt: req.createdAt.toISOString(),
            note: req.note,
          }))}
        />
      )}

      <TenantListManager
        tenants={tenants.map((tenant) => ({
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          businessType: tenant.businessType,
          plan: tenant.plan,
          isActive: tenant.isActive,
          disabledModules: tenant.disabledModules,
          createdAt: tenant.createdAt.toISOString(),
          outletCount: tenant.outletCount,
          userCount: tenant.userCount,
          totalOmzet: tenant.totalOmzet,
        }))}
      />
    </div>
  );
}
