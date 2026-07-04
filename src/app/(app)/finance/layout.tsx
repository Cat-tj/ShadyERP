import { requireModule } from "@/server/require-session";

export const metadata = {
  title: "Keuangan",
};

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  await requireModule("keuangan");
  return <>{children}</>;
}
