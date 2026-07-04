import { requireModule } from "@/server/require-session";

export default async function PengeluaranLayout({ children }: { children: React.ReactNode }) {
  await requireModule("keuangan");
  return <>{children}</>;
}
