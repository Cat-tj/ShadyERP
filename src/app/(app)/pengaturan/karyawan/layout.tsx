import Link from "next/link";
import { requireSessionWithTenant } from "@/server/require-session";
import { resolveEnabledModules } from "@/lib/modules";

export default async function KaryawanLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = await requireSessionWithTenant();
  const enabled = resolveEnabledModules(tenant?.disabledModules ?? []);

  if (!enabled.has("hr")) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm mt-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-3xl">
          👥
        </div>
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Modul Karyawan Tidak Aktif</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Modul <strong>HR &amp; Kepegawaian</strong> saat ini dinonaktifkan untuk toko Anda. Aktifkan modul ini terlebih dahulu di tab Modul untuk mengelola karyawan dan hak akses.
        </p>
        <div className="mt-6">
          <Link
            href="/pengaturan/modul"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Aktifkan Modul
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
