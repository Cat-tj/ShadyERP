import { requireRole } from "@/server/require-session";
import { listUsers } from "@/server/services/user-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { KaryawanManager } from "@/components/pengaturan/karyawan-manager";

export default async function KaryawanPage() {
  const user = await requireRole(["OWNER"]);

  const [users, outlets] = await Promise.all([
    listUsers(user.tenantId),
    listAllOutlets(user.tenantId),
  ]);

  return (
    <KaryawanManager
      outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        pin: u.pin,
        isActive: u.isActive,
        outletNames: u.userOutlets.map((uo) => uo.outlet.name),
        outletIds: u.userOutlets.map((uo) => uo.outletId),
        jobTitle: u.jobTitle,
      }))}
    />
  );
}
