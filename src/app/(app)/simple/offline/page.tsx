import Link from "next/link";
import { OfflineQueuePanel } from "@/components/simple/offline-queue-panel";

export default function SimpleOfflinePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Offline Sync</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Pantau transaksi POS yang tersimpan lokal saat internet putus.
          </p>
        </div>
        <Link
          href="/kasir"
          className="flex min-h-[40px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Buka Kasir
        </Link>
      </div>

      <OfflineQueuePanel />
    </div>
  );
}
