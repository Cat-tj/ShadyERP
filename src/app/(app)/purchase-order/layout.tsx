import { requireModule } from "@/server/require-session";

export default async function PurchaseOrderLayout({ children }: { children: React.ReactNode }) {
  await requireModule("inventory");
  return children;
}
