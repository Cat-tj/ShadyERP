"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSaleAction } from "@/app/(app)/kasir/actions";
import { flushQueue, listQueuedSales, removeQueuedSale, type QueuedSale } from "@/lib/offline-queue";
import { formatJam, formatRupiah, formatTanggalPendek } from "@/lib/format";

export function OfflineQueuePanel() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueuedSale[]>([]);
  const [online, setOnline] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    setOnline(navigator.onLine);
    setQueue(await listQueuedSales());
  }

  function sync() {
    startTransition(async () => {
      await flushQueue(createSaleAction);
      await refresh();
      router.refresh();
    });
  }

  useEffect(() => {
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    const interval = window.setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.clearInterval(interval);
    };
  }, []);

  const total = queue.reduce((sum, item) => sum + item.payload.amountPaid, 0);
  const failedCount = queue.filter((item) => item.lastError).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Status koneksi</p>
          <p className={`mt-2 text-xl font-bold ${online ? "text-emerald-600" : "text-red-600"}`}>
            {online ? "Online" : "Offline"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Pending sync</p>
          <p className="mt-2 text-xl font-bold text-[var(--color-text)]">{queue.length} transaksi</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Total pending</p>
          <p className="mt-2 font-mono-data text-xl font-bold text-[var(--color-text)]">{formatRupiah(total)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Transaksi belum terkirim</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Data ini tersimpan di device kasir. Jangan hapus browser data sebelum semua terkirim.
            </p>
          </div>
          <button
            type="button"
            onClick={sync}
            disabled={!online || queue.length === 0 || isPending}
            className="min-h-[42px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-45"
          >
            {isPending ? "Mengirim..." : "Coba sinkron"}
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="mt-4 rounded-lg bg-[var(--color-bg)] px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
            Tidak ada transaksi offline yang menunggu.
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {queue.map((item) => (
              <div key={item.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {formatTanggalPendek(item.createdAt)}, {formatJam(item.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {item.payload.items.length} item · {item.payload.paymentMethod} · {item.payload.orderType}
                    </p>
                    {item.lastError && (
                      <p className="mt-2 rounded bg-[var(--color-warning-bg)] px-2 py-1 text-xs text-[var(--color-warning-text)]">
                        {item.lastError}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono-data text-sm font-bold text-[var(--color-text)]">
                      {formatRupiah(item.payload.amountPaid)}
                    </p>
                    {item.lastError && (
                      <button
                        type="button"
                        onClick={async () => {
                          await removeQueuedSale(item.id);
                          await refresh();
                        }}
                        className="mt-2 text-xs font-semibold text-[var(--color-danger)] underline"
                      >
                        Buang
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {failedCount > 0 && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Transaksi gagal biasanya karena stok berubah saat offline. Cek itemnya sebelum dibuang.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
