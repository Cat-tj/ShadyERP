import { getCardByUid } from "@/server/services/uid-card-service";
import { getMemberPublicProfile } from "@/server/services/member-service";
import { prisma } from "@/lib/prisma";
import { RegisterMemberForm } from "@/components/member-portal/register-member-form";
import { MemberProfile } from "@/components/member-portal/member-profile";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AlertTriangleIcon } from "@/components/ui/icons";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-backdrop flex min-h-screen items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <GlassPanel strong className="w-full max-w-sm rounded-xl p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
        <AlertTriangleIcon aria-hidden className="h-6 w-6" />
      </div>
      <h1 className="font-display text-lg font-semibold text-[var(--color-text)]">{title}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
    </GlassPanel>
  );
}

export default async function CustomerCardPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const card = await getCardByUid(uid);

  if (!card) {
    return (
      <Shell>
        <InfoCard
          title="Kartu tidak ditemukan"
          description="Kode QR ini tidak valid. Pastikan kamu scan kartu asli, atau hubungi kasir."
        />
      </Shell>
    );
  }

  if (card.cardType !== "MEMBER") {
    return (
      <Shell>
        <InfoCard title="Kartu karyawan" description="Kartu ini bukan kartu member pelanggan." />
      </Shell>
    );
  }

  if (card.status === "SUSPENDED" || card.status === "LOST") {
    return (
      <Shell>
        <InfoCard
          title="Kartu tidak aktif"
          description="Kartu ini sudah dinonaktifkan. Hubungi kasir untuk bantuan."
        />
      </Shell>
    );
  }

  if (card.status === "UNASSIGNED" || !card.memberId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: card.tenantId } });
    return (
      <Shell>
        <RegisterMemberForm uid={uid} tenantName={tenant?.name ?? "Toko"} />
      </Shell>
    );
  }

  const profile = await getMemberPublicProfile(card.memberId);
  if (!profile) {
    return (
      <Shell>
        <InfoCard title="Data member tidak ditemukan" description="Hubungi kasir untuk bantuan." />
      </Shell>
    );
  }

  return (
    <Shell>
      <MemberProfile
        uid={uid}
        data={{
          id: profile.member.id,
          name: profile.member.name,
          points: profile.member.points,
          depositBalance: profile.member.depositBalance,
          joinedAt: profile.member.joinedAt.toISOString(),
          sales: profile.sales.map((sale) => ({
            id: sale.id,
            invoiceNumber: sale.invoiceNumber,
            total: sale.total,
            createdAt: sale.createdAt.toISOString(),
            outletName: sale.outlet.name,
          })),
        }}
      />
    </Shell>
  );
}
