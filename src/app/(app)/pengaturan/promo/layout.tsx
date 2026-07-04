import { requireModule } from "@/server/require-session";

export default async function PengaturanPromoLayout({ children }: { children: React.ReactNode }) {
  await requireModule("promo");
  return <>{children}</>;
}
