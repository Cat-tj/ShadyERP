import { requireModule } from "@/server/require-session";

export default async function PengaturanKartuLayout({ children }: { children: React.ReactNode }) {
  await requireModule("member");
  return <>{children}</>;
}
