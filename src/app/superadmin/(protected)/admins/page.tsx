import { requireSuperAdmin } from "@/server/require-super-admin";
import { listSuperAdmins } from "@/server/services/super-admin-service";
import { SuperAdminAccountManager } from "@/components/superadmin/super-admin-account-manager";

export default async function SuperAdminAccountsPage() {
  await requireSuperAdmin();
  const admins = await listSuperAdmins();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Akun Superadmin</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Kelola akun pengelola platform Altora.
        </p>
      </div>
      <SuperAdminAccountManager
        admins={admins.map((admin) => ({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          createdAt: admin.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
