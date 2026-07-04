import { requireModule } from "@/server/require-session";

export default async function AbsensiLayout({ children }: { children: React.ReactNode }) {
  await requireModule("hr");
  return <>{children}</>;
}
