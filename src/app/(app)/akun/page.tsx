import { requireSession } from "@/server/require-session";
import { ChangePasswordForm } from "@/components/akun/change-password-form";
import { prisma } from "@/lib/prisma";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { formatTanggal } from "@/lib/format";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Pemilik Bisnis (Owner)",
  MANAGER: "Manajer Toko (Manager)",
  STAFF: "Staf Kasir/Operator (Staff)",
};

const ROLE_COLOR: Record<string, string> = {
  OWNER: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-[var(--color-primary)]/20",
  MANAGER: "bg-[var(--color-warning-surface)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  STAFF: "bg-[var(--color-success-surface)] text-[var(--color-success)] border-[var(--color-success)]/20",
};

export default async function AkunPage() {
  const sessionUser = await requireSession();
  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });
  const outlets = await listOutletsForUser(sessionUser.tenantId, sessionUser.id, sessionUser.role);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">Akun Saya</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Kelola profil personal, tingkat otorisasi peran, dan detail keamanan sistem Anda.
        </p>
      </div>

      {/* Profile Detail Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-lg font-bold text-[var(--color-primary)]">
            {sessionUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[var(--color-text)] truncate">{sessionUser.name}</h2>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">{sessionUser.email}</p>
          </div>
        </div>

        <div className="grid gap-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-2.5">
            <span className="font-semibold text-[var(--color-text-secondary)]">Hak Akses Peran</span>
            <span className={`rounded-full border px-2.5 py-0.5 font-bold ${ROLE_COLOR[sessionUser.role] ?? "bg-[var(--color-bg-secondary)]"}`}>
              {ROLE_LABEL[sessionUser.role] ?? sessionUser.role}
            </span>
          </div>

          {dbUser?.jobTitle && (
            <div className="flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-2.5">
              <span className="font-semibold text-[var(--color-text-secondary)]">Jabatan Pekerjaan</span>
              <span className="font-bold text-[var(--color-text)]">{dbUser.jobTitle}</span>
            </div>
          )}

          {dbUser?.phone && (
            <div className="flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-2.5">
              <span className="font-semibold text-[var(--color-text-secondary)]">Nomor Telepon</span>
              <span className="font-bold text-[var(--color-text)]">{dbUser.phone}</span>
            </div>
          )}

          <div className="flex items-start justify-between border-b border-dashed border-[var(--color-border)] pb-2.5">
            <span className="font-semibold text-[var(--color-text-secondary)]">Akses Outlet</span>
            <div className="flex flex-col items-end gap-1">
              {outlets.length === 0 ? (
                <span className="text-[var(--color-text-muted)] italic">Tidak ada akses outlet</span>
              ) : (
                outlets.map((outlet) => (
                  <span key={outlet.id} className="font-bold text-[var(--color-text)] text-right">
                    {outlet.name}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-2.5">
            <span className="font-semibold text-[var(--color-text-secondary)]">Status Keamanan</span>
            <span className="inline-flex items-center gap-1 font-bold text-[var(--color-success)]">
              ● Aktif & Terlindungi
            </span>
          </div>

          {dbUser?.createdAt && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="font-semibold text-[var(--color-text-secondary)]">Tanggal Terdaftar</span>
              <span className="font-medium text-[var(--color-text-secondary)]">
                {formatTanggal(dbUser.createdAt.toISOString())}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Ganti Password Keamanan</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
