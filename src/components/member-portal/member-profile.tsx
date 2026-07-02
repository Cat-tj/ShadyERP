"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemPointsAction } from "@/app/q/[uid]/actions";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { REDEEM_RATE_RUPIAH_PER_POINT } from "@/lib/loyalty";
import { GlassPanel } from "@/components/ui/glass-panel";

export type MemberProfileData = {
  id: string;
  name: string;
  points: number;
  depositBalance: number;
  joinedAt: string;
  sales: { id: string; invoiceNumber: string; total: number; createdAt: string; outletName: string }[];
};

export function MemberProfile({ uid, data }: { uid: string; data: MemberProfileData }) {
  const router = useRouter();
  const [showRedeem, setShowRedeem] = useState(false);
  const [points, setPoints] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRedeem() {
    setError(null);
    const pointsNumber = Number(points);
    if (!Number.isFinite(pointsNumber) || pointsNumber <= 0) {
      setError("Masukkan jumlah poin yang valid.");
      return;
    }
    startTransition(async () => {
      const result = await redeemPointsAction(uid, data.id, pointsNumber);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setPoints("");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-sm">
      <GlassPanel strong className="rounded-xl p-6 text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] font-display text-xl font-semibold text-[var(--color-on-primary)]">
          {data.name.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--color-text)]">{data.name}</h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Member sejak {formatTanggalPendek(data.joinedAt)}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/50 p-3">
            <p className="font-display text-2xl font-semibold text-[var(--color-text)]">{data.points}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Poin</p>
          </div>
          <div className="rounded-lg bg-white/50 p-3">
            <p className="font-display tabular-nums text-2xl font-semibold text-[var(--color-text)]">
              {formatRupiah(data.depositBalance)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">Saldo</p>
          </div>
        </div>

        {!showRedeem ? (
          <button
            onClick={() => setShowRedeem(true)}
            disabled={data.points <= 0}
            className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-white/40 text-sm font-semibold text-[var(--color-text)] transition-colors duration-150 hover:bg-white/70 disabled:opacity-40"
          >
            Tukar poin jadi saldo
          </button>
        ) : (
          <div className="mt-4 rounded-lg bg-white/50 p-3 text-left">
            {success ? (
              <p className="text-sm text-[var(--color-text)]">
                Poin berhasil ditukar! Saldo kamu sudah bertambah.
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
                  1 poin = {formatRupiah(REDEEM_RATE_RUPIAH_PER_POINT)} saldo. Kamu punya {data.points} poin.
                </p>
                {error && (
                  <p className="mb-2 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-xs text-[var(--color-warning-text)]">
                    {error}
                  </p>
                )}
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={data.points}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder={`Maks ${data.points}`}
                  className="mb-2 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white/70 px-3 text-sm tabular-nums outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white"
                />
                <button
                  onClick={handleRedeem}
                  disabled={isPending}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
                >
                  {isPending ? "Memproses..." : "Tukar sekarang"}
                </button>
              </>
            )}
          </div>
        )}
      </GlassPanel>

      <GlassPanel strong className="mt-4 rounded-xl p-4">
        <h2 className="mb-2 font-display text-sm font-semibold text-[var(--color-text)]">Riwayat belanja</h2>
        {data.sales.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">Belum ada transaksi.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {data.sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{sale.outletName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {formatTanggalPendek(sale.createdAt)} · {sale.invoiceNumber}
                  </p>
                </div>
                <span className="tabular-nums text-sm font-semibold text-[var(--color-text)]">
                  {formatRupiah(sale.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
