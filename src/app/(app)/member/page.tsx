import { requireSession } from "@/server/require-session";
import { listMembers } from "@/server/services/member-service";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

export default async function MemberPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireSession();
  const { q } = await searchParams;
  const members = await listMembers(user.tenantId, q);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Member</h1>
      </div>

      <form action="/member" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau nomor HP..."
          className="min-h-[48px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
        <button
          type="submit"
          className="min-h-[48px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
        >
          Cari
        </button>
      </form>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {members.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {q
                ? "Member tidak ditemukan. Coba kata kunci lain."
                : "Belum ada member. Cetak kartu QR di menu Pengaturan → Kartu, lalu bagikan ke pelanggan →"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {members.map((member) => (
              <a
                key={member.id}
                href={`/member/${member.id}`}
                className="flex items-center justify-between gap-3 p-4 hover:bg-[var(--color-bg)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{member.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {member.phone} · Sejak {formatTanggalPendek(member.joinedAt)}
                    {!member.uidCard && " · Belum ada kartu"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular-nums text-sm font-bold text-[var(--color-text)]">{member.points} poin</p>
                  <p className="tabular-nums text-xs text-[var(--color-text-secondary)]">
                    {formatRupiah(member.depositBalance)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
