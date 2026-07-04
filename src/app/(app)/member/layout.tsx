import { requireModule } from "@/server/require-session";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireModule("member");
  return <>{children}</>;
}
