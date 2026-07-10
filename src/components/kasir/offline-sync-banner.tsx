"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { createSaleAction } from "@/app/(app)/kasir/actions";
import { listQueuedSales, removeQueuedSale, flushQueue, type QueuedSale } from "@/lib/offline-queue";

export function OfflineSyncBanner() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueuedSale[]>([]);
  const [isSyncing, startTransition] = useTransition();

  async function refresh() {
    setQueue(await listQueuedSales());
  }

  function sync() {
    startTransition(async () => {
      const { succeeded } = await flushQueue(createSaleAction);
      await refresh();
      if (succeeded > 0) router.refresh();
    });
  }

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => {
      refresh();
    }, 0);
    window.addEventListener("online", sync);
    // Poll terus (bukan cuma pas event "online") — transaksi offline baru
    // ditambahkan lewat komponen lain (PaymentSheet) yang tidak punya jalur
    // langsung memberi tahu banner ini, jadi cek antrian berkala jadi cara
    // paling sederhana biar banner ini selalu tampil terkini.
    const pollInterval = setInterval(refresh, 3_000);
    const syncInterval = setInterval(() => {
      if (navigator.onLine) sync();
    }, 30_000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.removeEventListener("online", sync);
      clearInterval(pollInterval);
      clearInterval(syncInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (queue.length === 0) return null;

  const total = queue.reduce((sum, q) => sum + q.payload.amountPaid, 0);
  const failedCount = queue.filter((q) => q.lastError).length;

  return (
    <div className="mb-3 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
      <div className="flex items-center justify-between gap-3">
        <span>
          📶 {queue.length} transaksi ({formatRupiah(total)}) menunggu disinkron
          {failedCount > 0 ? ` · ${failedCount} gagal` : ""}
        </span>
        <button
          onClick={sync}
          disabled={isSyncing}
          className="shrink-0 rounded-lg border border-current px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
        >
          {isSyncing ? "Mengirim..." : "Coba sinkron"}
        </button>
      </div>
      {queue
        .filter((q) => q.lastError)
        .map((q) => (
          <div key={q.id} className="mt-2 flex items-center justify-between gap-2 rounded bg-black/5 px-2 py-1.5 text-xs">
            <span className="min-w-0 truncate">{q.lastError}</span>
            <button
              onClick={async () => {
                await removeQueuedSale(q.id);
                refresh();
              }}
              className="shrink-0 font-semibold underline"
            >
              Buang
            </button>
          </div>
        ))}
    </div>
  );
}
