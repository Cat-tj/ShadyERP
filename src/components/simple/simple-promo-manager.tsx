"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPromoAction,
  updatePromoAction,
} from "@/app/(app)/pengaturan/promo/actions";
import type { PromoScope, PromoDiscountType } from "@prisma/client";

export type SimplePromoRow = {
  id: string;
  name: string;
  discountType: PromoDiscountType;
  discountValue: number;
  scope: PromoScope;
  categoryId: string | null;
  minSpend: number;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export function SimplePromoManager({ promos }: { promos: SimplePromoRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("Happy Hour");
  const [discountValue, setDiscountValue] = useState("20");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState<string | null>(null);

  function toggleActive(promo: SimplePromoRow) {
    startTransition(async () => {
      await updatePromoAction(promo.id, {
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        scope: promo.scope,
        categoryId: promo.categoryId,
        minSpend: promo.minSpend,
        daysOfWeek: promo.daysOfWeek,
        startTime: promo.startTime,
        endTime: promo.endTime,
        isActive: !promo.isActive,
      });
      router.refresh();
    });
  }

  function submitNew(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsedDiscount = Number(discountValue);
    if (!name.trim()) return setError("Nama promo wajib diisi.");
    if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0 || parsedDiscount > 100) {
      return setError("Diskon harus antara 1-100%.");
    }
    if (!startTime || !endTime) return setError("Jam mulai & selesai wajib diisi.");

    startTransition(async () => {
      const result = await createPromoAction({
        name: name.trim(),
        discountType: "PERCENT",
        discountValue: parsedDiscount,
        scope: "ALL",
        categoryId: null,
        minSpend: 0,
        daysOfWeek: [],
        startTime,
        endTime,
        isActive: true,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      setName("Happy Hour");
      setDiscountValue("20");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Harga Beda Per Jam</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Aktifkan diskon otomatis di jam tertentu (mis. jam sepi) — berlaku tiap hari, otomatis nyala/mati
          sesuai jam. Buat pengaturan lebih detail (per kategori, per hari), buka Pengaturan &gt; Promo.
        </p>
      </div>

      {promos.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
          Belum ada promo jam tertentu. Tambah satu di bawah.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-text)]">{promo.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {promo.discountType === "PERCENT" ? `${promo.discountValue}%` : `Rp${promo.discountValue}`} · Jam{" "}
                  {promo.startTime}–{promo.endTime}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={promo.isActive}
                onClick={() => toggleActive(promo)}
                disabled={isPending}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                  promo.isActive ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    promo.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={submitNew}
          className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama promo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Happy Hour Sore"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Diskon (%)</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jam mulai</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jam selesai</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          {error && <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex min-h-[48px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)]"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex min-h-[48px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-primary)]"
        >
          + Tambah jam diskon
        </button>
      )}
    </div>
  );
}
