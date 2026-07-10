import { requireModule } from "@/server/require-session";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  await requireModule("inventory");
  return children;
}
