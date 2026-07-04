import { requireRole } from "@/server/require-session";
import { getSuppliers } from "@/server/services/supplier-service";
import { SupplierManager } from "@/components/supplier/supplier-manager";

export default async function SupplierPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const suppliers = await getSuppliers(user.tenantId);

  return (
    <SupplierManager
      suppliers={suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone ?? undefined,
        email: s.email ?? undefined,
        contactPerson: s.contactPerson ?? undefined,
        paymentTerms: s.paymentTerms ?? undefined,
        status: s.status,
        rating: s.rating ?? undefined,
      }))}
    />
  );
}
