import { requireModule } from "@/server/require-session";

export default async function KaryawanLayout({ children }: { children: React.ReactNode }) {
  await requireModule("hr");
  return <>{children}</>;
}
