import { requireSession } from "@/server/require-session";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { name: true },
  });

  return (
    <AppShell userName={user.name} role={user.role} tenantName={tenant?.name ?? "Toko Saya"}>
      {children}
    </AppShell>
  );
}
