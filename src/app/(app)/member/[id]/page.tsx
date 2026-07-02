import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/require-session";
import { getMemberDetail } from "@/server/services/member-service";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { AssignCardForm } from "@/components/member-portal/assign-card-form";
import { MemberIdentitySection } from "@/components/member/member-identity-section";

const POINT_TYPE_LABEL: Record<string, string> = {
  EARN: "Dapat poin",
  REDEEM: "Tukar poin",
  ADJUST: "Penyesuaian",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();
  const detail = await getMemberDetail(user.tenantId, id);

  if (!detail) {
    notFound();
  }

  const { member, sales, pointTransactions } = detail;
  const canManage = user.role === "OWNER" || user.role === "MANAGER";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link href="/member" className="text-sm font-medium text-[var(--color-primary)]">
        ← Kembali ke daftar member
      </Link>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <MemberIdentitySection
          memberId={member.id}
          name={member.name}
          phone={member.phone}
          email={member.email}
          joinedLabel={formatTanggal(member.joinedAt)}
          cardSerial={member.uidCard?.serialNumber ?? null}
          canManage={canManage}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--color-bg)] p-3">
            <p className="font-display text-2xl font-semibold text-[var(--color-text)]">{member.points}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Poin</p>
          </div>
          <div className="rounded-lg bg-[var(--color-bg)] p-3">
            <p className="font-display tabular-nums text-2xl font-semibold text-[var(--color-text)]">
              {formatRupiah(member.depositBalance)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">Saldo</p>
          </div>
        </div>

        {!member.uidCard && canManage && (
          <div className="mt-4">
            <AssignCardForm memberId={member.id} />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Riwayat transaksi</h2>
        {sales.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">Belum ada transaksi.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{sale.invoiceNumber}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{formatTanggal(sale.createdAt)}</p>
                </div>
                <span className="tabular-nums text-sm font-semibold text-[var(--color-text)]">
                  {formatRupiah(sale.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Riwayat poin</h2>
        {pointTransactions.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">Belum ada riwayat poin.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {pointTransactions.map((pt) => (
              <div key={pt.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{POINT_TYPE_LABEL[pt.type]}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{formatTanggal(pt.createdAt)}</p>
                </div>
                <span
                  className={`tabular-nums text-sm font-semibold ${
                    pt.points >= 0 ? "text-[var(--color-text)]" : "text-[var(--color-danger)]"
                  }`}
                >
                  {pt.points > 0 ? "+" : ""}
                  {pt.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
