import { requireModule } from "@/server/require-session";

export default async function DapurLayout({ children }: { children: React.ReactNode }) {
  await requireModule("pesanan-digital");
  return <>{children}</>;
}
