import { notFound } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getWorkOrderById } from "@/server/services/work-order-service";
import { WorkOrderDetail } from "@/components/produksi/work-order-detail";

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);

  const workOrder = await getWorkOrderById(user.tenantId, id);
  if (!workOrder) notFound();

  return <WorkOrderDetail workOrder={workOrder} canManage={user.role === "OWNER" || user.role === "MANAGER"} />;
}
