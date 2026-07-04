import { requireModule } from "@/server/require-session";

export default async function PesananMejaLayout({ children }: { children: React.ReactNode }) {
  await requireModule("pesanan-digital");
  return <>{children}</>;
}
