import { requireModule } from "@/server/require-session";

export default async function ProduksiLayout({ children }: { children: React.ReactNode }) {
  await requireModule("produksi");
  return children;
}
