import { requireModule } from "@/server/require-session";

export default async function PengaturanMejaLayout({ children }: { children: React.ReactNode }) {
  await requireModule("pesanan-digital");
  return <>{children}</>;
}
