import Link from "next/link";
import { requireSessionWithTenant } from "@/server/require-session";
import { resolveEnabledModules } from "@/lib/modules";

export default async function PengaturanMejaLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = await requireSessionWithTenant();
  const enabled = resolveEnabledModules(tenant?.disabledModules ?? []);

  if (!enabled.has("pesanan-digital")) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm mt-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-3xl">
          🪑
        </div>
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Modul Meja &amp; QR Meja Tidak Aktif</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Modul <strong>Pemesanan Digital</strong> saat ini dinonaktifkan untuk toko Anda. Aktifkan modul ini terlebih dahulu di tab Modul untuk mengelola tata letak dan meja.
        </p>
        <div className="mt-6">
          <Link
            href="/pengaturan/modul"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Aktifkan Modul
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
