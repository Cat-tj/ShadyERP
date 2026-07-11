"use client";

import { useState } from "react";
import { lockPeriodAction, unlockPeriodAction } from "@/app/(app)/finance/tutup-buku/actions";

export function PeriodLockManager({
  currentLockDate,
  isBalanced,
}: {
  currentLockDate: string | null;
  isBalanced: boolean;
}) {
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLock(e: React.FormEvent) {
    e.preventDefault();
    if (!dateStr) return;
    if (!confirm(`Tutup buku sampai ${formatId(dateStr)}? Transaksi di tanggal ini ke belakang tidak bisa diubah lagi.`)) {
      return;
    }
    setLoading(true);
    setError(null);
    const result = await lockPeriodAction(dateStr);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Gagal menutup buku.");
    }
  }

  async function handleUnlock() {
    if (!confirm("Buka kunci tutup buku? Semua tanggal jadi bisa diubah lagi sampai dikunci ulang.")) return;
    setLoading(true);
    setError(null);
    const result = await unlockPeriodAction();
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Gagal membuka kunci.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
          Status Pembukuan
        </h2>
        {currentLockDate ? (
          <p className="mt-2 text-sm text-[var(--color-text)]">
            Sudah ditutup sampai{" "}
            <span className="font-bold">{formatId(currentLockDate)}</span>. Transaksi pada atau sebelum
            tanggal ini tidak bisa diposting, diubah, dibatalkan, atau diretur lagi.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Belum pernah tutup buku — semua tanggal masih bisa diubah bebas.
          </p>
        )}
        {!isBalanced && (
          <p className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
            Neraca Saldo saat ini belum balance. Sebaiknya cek Neraca Saldo dulu sebelum tutup buku.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleLock} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <label className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">
          Tutup buku sampai tanggal
        </label>
        <input
          type="date"
          value={dateStr}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDateStr(e.target.value)}
          className="min-h-[38px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer min-h-[38px] rounded-xl bg-[var(--color-primary)] px-4 text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Memproses..." : "Tutup Buku"}
        </button>
      </form>

      {currentLockDate && (
        <button
          type="button"
          onClick={handleUnlock}
          disabled={loading}
          className="cursor-pointer min-h-[38px] rounded-xl border border-red-500/30 px-4 text-xs font-bold text-red-600 transition-all hover:bg-red-500/10 disabled:opacity-40"
        >
          Buka Kunci (kalau salah input tanggal)
        </button>
      )}
    </div>
  );
}

function formatId(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
