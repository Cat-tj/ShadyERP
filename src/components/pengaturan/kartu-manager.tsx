"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBatchAction } from "@/app/(app)/pengaturan/kartu/actions";
import { formatTanggal } from "@/lib/format";
import { useToast, Toast } from "@/components/toast";

export type BatchRow = {
  id: string;
  cardType: "MEMBER" | "EMPLOYEE";
  quantity: number;
  serialPrefix: string;
  createdAt: string;
  cardCount: number;
};

const CARD_TYPE_LABEL: Record<string, string> = {
  MEMBER: "Member",
  EMPLOYEE: "Karyawan",
};

export function KartuManager({ batches }: { batches: BatchRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [cardType, setCardType] = useState<"MEMBER" | "EMPLOYEE">("MEMBER");
  const [quantity, setQuantity] = useState("20");
  const [serialPrefix, setSerialPrefix] = useState("MBR");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    const qty = Number(quantity);
    startTransition(async () => {
      const result = await createBatchAction({ cardType, quantity: qty, serialPrefix });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Batch kartu dibuat");
      router.refresh();
      if (result.batchId) {
        router.push(`/pengaturan/kartu/${result.batchId}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Buat batch kartu baru</h2>

        {error && (
          <div className="mb-3 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Jenis kartu</label>
            <select
              value={cardType}
              onChange={(e) => {
                const type = e.target.value as "MEMBER" | "EMPLOYEE";
                setCardType(type);
                setSerialPrefix(type === "MEMBER" ? "MBR" : "EMP");
              }}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              <option value="MEMBER">Member</option>
              <option value="EMPLOYEE">Karyawan</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Jumlah</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-sm font-medium text-[var(--color-text)]">Awalan nomor seri</label>
            <input
              value={serialPrefix}
              onChange={(e) => setSerialPrefix(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="MBR"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={isPending}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {isPending ? "Membuat..." : "Buat batch"}
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-base font-bold text-[var(--color-text)]">Batch tercetak</h2>
        {batches.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada batch kartu. Buat batch pertamamu di atas →
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {batch.serialPrefix} · {CARD_TYPE_LABEL[batch.cardType]} · {batch.cardCount} kartu
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Dibuat {formatTanggal(batch.createdAt)}</p>
                </div>
                <Link
                  href={`/pengaturan/kartu/${batch.id}`}
                  className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] flex items-center hover:bg-[var(--color-bg)]"
                >
                  Lihat & cetak
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
