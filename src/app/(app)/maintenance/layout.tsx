import { requireModule } from "@/server/require-session";

export default async function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  await requireModule("inventory");
  return children;
}
