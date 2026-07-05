import Link from "next/link";
import { requireSessionWithTenant } from "@/server/require-session";
import { resolveEnabledModules } from "@/lib/modules";

export default async function PengaturanKartuLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = await requireSessionWithTenant();
  const enabled = resolveEnabledModules(tenant?.disabledModules ?? []);

  if (!enabled.has("member")) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm mt-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-3xl">
          💳
        </div>
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Modul Kartu &amp; Member Tidak Aktif</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Modul <strong>Member &amp; Loyalitas</strong> saat ini dinonaktifkan untuk toko Anda. Aktifkan modul ini terlebih dahulu di tab Modul untuk mengelola kartu member.
        </p>
        <div className="mt-6">
          <Link
            href="/pengaturan/modul"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors cursor-pointer"
          >
            Aktifkan Modul
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
