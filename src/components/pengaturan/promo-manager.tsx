"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PromoDiscountType, PromoScope } from "@prisma/client";
import { formatRupiah } from "@/lib/format";
import { createPromoAction, updatePromoAction, deletePromoAction } from "@/app/(app)/pengaturan/promo/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type CategoryOption = { id: string; name: string };

export type PromoRow = {
  id: string;
  name: string;
  discountType: PromoDiscountType;
  discountValue: number;
  scope: PromoScope;
  categoryId: string | null;
  categoryName: string | null;
  minSpend: number;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function describeSchedule(promo: PromoRow): string {
  const days = promo.daysOfWeek.length === 0 ? "Setiap hari" : promo.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ");
  return `${days} · ${promo.startTime}–${promo.endTime}`;
}

function describeDiscount(promo: PromoRow): string {
  const amount = promo.discountType === "PERCENT" ? `${promo.discountValue}%` : formatRupiah(promo.discountValue);
  const scope = promo.scope === "CATEGORY" ? `kategori ${promo.categoryName ?? "?"}` : "semua produk";
  const min = promo.minSpend > 0 ? ` · min. belanja ${formatRupiah(promo.minSpend)}` : "";
  return `Diskon ${amount} untuk ${scope}${min}`;
}

export function PromoManager({ promos, categories }: { promos: PromoRow[]; categories: CategoryOption[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromoRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(promo: PromoRow) {
    if (!confirm(`Hapus promo "${promo.name}"?`)) return;
    startTransition(async () => {
      const result = await deletePromoAction(promo.id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Promo dihapus");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text)]">Promo terjadwal</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Diskon otomatis aktif sendiri sesuai jadwal — tidak perlu diinput manual di kasir.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="min-h-[40px] shrink-0 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)]"
        >
          + Promo
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Belum ada promo. Tambahkan promo pertamamu.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {promo.name}
                  {!promo.isActive && (
                    <span className="ml-2 rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
                      Nonaktif
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">{describeDiscount(promo)}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{describeSchedule(promo)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    setEditing(promo);
                    setModalOpen(true);
                  }}
                  className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                >
                  Ubah
                </button>
                <button
                  onClick={() => remove(promo)}
                  disabled={isPending}
                  className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-bg)] disabled:opacity-40"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <PromoFormModal
          promo={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}

function PromoFormModal({
  promo,
  categories,
  onClose,
  onSaved,
}: {
  promo: PromoRow | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(promo?.name ?? "");
  const [discountType, setDiscountType] = useState<PromoDiscountType>(promo?.discountType ?? "PERCENT");
  const [discountValue, setDiscountValue] = useState(promo ? String(promo.discountValue) : "");
  const [scope, setScope] = useState<PromoScope>(promo?.scope ?? "ALL");
  const [categoryId, setCategoryId] = useState(promo?.categoryId ?? "");
  const [minSpend, setMinSpend] = useState(promo ? String(promo.minSpend) : "0");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(promo?.daysOfWeek ?? []);
  const [startTime, setStartTime] = useState(promo?.startTime ?? "00:00");
  const [endTime, setEndTime] = useState(promo?.endTime ?? "23:59");
  const [isActive, setIsActive] = useState(promo?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleDay(day: number) {
    setDaysOfWeek((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }

  function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("Nama promo wajib diisi.");
      return;
    }
    const valueNumber = Number(discountValue);
    if (!Number.isFinite(valueNumber) || valueNumber <= 0) {
      setError("Nilai diskon tidak valid.");
      return;
    }
    if (scope === "CATEGORY" && !categoryId) {
      setError("Pilih kategori untuk promo kategori.");
      return;
    }

    startTransition(async () => {
      const input = {
        name: name.trim(),
        discountType,
        discountValue: valueNumber,
        scope,
        categoryId: scope === "CATEGORY" ? categoryId : null,
        minSpend: Number(minSpend) || 0,
        daysOfWeek,
        startTime,
        endTime,
        isActive,
      };
      const result = promo ? await updatePromoAction(promo.id, input) : await createPromoAction(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(promo ? "Promo disimpan" : "Promo ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">{promo ? "Ubah promo" : "Tambah promo"}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama promo</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Happy Hour Sore"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jenis diskon</label>
              <select
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value as PromoDiscountType)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
              >
                <option value="PERCENT">Persen (%)</option>
                <option value="FIXED">Nominal (Rp)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Nilai</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder={discountType === "PERCENT" ? "10" : "10000"}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Berlaku untuk</label>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as PromoScope)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
            >
              <option value="ALL">Semua produk</option>
              <option value="CATEGORY">Kategori tertentu</option>
            </select>
          </div>

          {scope === "CATEGORY" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Kategori</label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Minimal belanja (opsional)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={minSpend}
              onChange={(event) => setMinSpend(event.target.value)}
              placeholder="0"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Hari berlaku</label>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`min-h-[36px] rounded-full px-3 text-xs font-medium ${
                    daysOfWeek.includes(index)
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                      : "border border-[var(--color-border)] text-[var(--color-text)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">Tidak pilih apa pun = berlaku setiap hari.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jam mulai</label>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jam selesai</label>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-5 w-5 rounded border-[var(--color-border)]"
            />
            Promo aktif
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : "Simpan promo"}
        </button>
      </div>
    </div>
  );
}
