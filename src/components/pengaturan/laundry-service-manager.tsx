"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LaundryServiceType } from "@prisma/client";
import {
  toggleLaundryServiceAction,
  upsertLaundryServiceAction,
} from "@/app/(app)/laundry/actions";
import { formatRupiah } from "@/lib/format";
import { Toast, useToast } from "@/components/toast";

type LaundryServiceRow = {
  id: string;
  name: string;
  serviceType: LaundryServiceType;
  pricePerKg: number | null;
  servicePrice: number;
  isActive: boolean;
};

const SERVICE_TYPE_OPTIONS: { value: LaundryServiceType; label: string; hint: string }[] = [
  { value: "KILOAN", label: "Kiloan", hint: "Hitung dari berat kg" },
  { value: "EXPRESS", label: "Express", hint: "Hitung dari berat kg, biasanya harga lebih tinggi" },
  { value: "SATUAN", label: "Satuan", hint: "Hitung per item" },
  { value: "DRY_CLEAN", label: "Dry clean", hint: "Hitung per item" },
  { value: "SETRIKA", label: "Setrika", hint: "Hitung per item" },
];

const SERVICE_TYPE_LABEL = Object.fromEntries(
  SERVICE_TYPE_OPTIONS.map((option) => [option.value, option.label])
) as Record<LaundryServiceType, string>;

function isWeightType(serviceType: LaundryServiceType) {
  return serviceType === "KILOAN" || serviceType === "EXPRESS";
}

const emptyDraft = {
  id: null as string | null,
  name: "",
  serviceType: "KILOAN" as LaundryServiceType,
  pricePerKg: "8000",
  servicePrice: "0",
  isActive: true,
};

export function LaundryServiceManager({ services }: { services: LaundryServiceRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isWeightBased = isWeightType(draft.serviceType);
  const activeCount = useMemo(() => services.filter((service) => service.isActive).length, [services]);

  function edit(service: LaundryServiceRow) {
    setDraft({
      id: service.id,
      name: service.name,
      serviceType: service.serviceType,
      pricePerKg: service.pricePerKg !== null ? String(service.pricePerKg) : "0",
      servicePrice: String(service.servicePrice),
      isActive: service.isActive,
    });
    setError(null);
  }

  function reset() {
    setDraft(emptyDraft);
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertLaundryServiceAction({
        id: draft.id,
        name: draft.name,
        serviceType: draft.serviceType,
        pricePerKg: isWeightBased ? Number(draft.pricePerKg) || 0 : null,
        servicePrice: Number(draft.servicePrice) || 0,
        isActive: draft.isActive,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast(draft.id ? "Layanan laundry diperbarui" : "Layanan laundry ditambahkan");
      reset();
      router.refresh();
    });
  }

  function toggle(service: LaundryServiceRow) {
    startTransition(async () => {
      const result = await toggleLaundryServiceAction(service.id, !service.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(!service.isActive ? "Layanan diaktifkan" : "Layanan dinonaktifkan");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-lg font-bold text-[var(--color-text)]">
          {draft.id ? "Edit layanan" : "Tambah layanan"}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Layanan aktif akan muncul di dropdown order laundry.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-3">
          <label className="text-sm font-medium text-[var(--color-text)]">
            Nama layanan
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Contoh: Bed cover, Sepatu, Express 6 jam"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          <label className="text-sm font-medium text-[var(--color-text)]">
            Tipe hitung
            <select
              value={draft.serviceType}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  serviceType: event.target.value as LaundryServiceType,
                }))
              }
              className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              {SERVICE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.hint}
                </option>
              ))}
            </select>
          </label>

          {isWeightBased ? (
            <label className="text-sm font-medium text-[var(--color-text)]">
              Harga per kg
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.pricePerKg}
                onChange={(event) => setDraft((prev) => ({ ...prev, pricePerKg: event.target.value }))}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
              />
            </label>
          ) : (
            <label className="text-sm font-medium text-[var(--color-text)]">
              Harga per item
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.servicePrice}
                onChange={(event) => setDraft((prev) => ({ ...prev, servicePrice: event.target.value }))}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
              />
            </label>
          )}

          {isWeightBased && (
            <label className="text-sm font-medium text-[var(--color-text)]">
              Biaya tambahan default
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.servicePrice}
                onChange={(event) => setDraft((prev) => ({ ...prev, servicePrice: event.target.value }))}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
              />
            </label>
          )}

          <label className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => setDraft((prev) => ({ ...prev, isActive: event.target.checked }))}
              className="h-5 w-5"
            />
            Aktif di dropdown order
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          {draft.id && (
            <button
              type="button"
              onClick={reset}
              className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)]"
            >
              Batal
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="min-h-[44px] flex-1 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-[var(--color-on-primary)] disabled:opacity-60"
          >
            {isPending ? "Menyimpan..." : draft.id ? "Simpan perubahan" : "Tambah layanan"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Jenis layanan</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {activeCount} layanan aktif dari {services.length} layanan.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada layanan laundry.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {services.map((service) => {
              const priceText = isWeightType(service.serviceType)
                ? `${formatRupiah(service.pricePerKg ?? 0)} / kg`
                : `${formatRupiah(service.servicePrice)} / item`;
              return (
                <div key={service.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[var(--color-text)]">{service.name}</p>
                      <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                        {SERVICE_TYPE_LABEL[service.serviceType]}
                      </span>
                      {!service.isActive && (
                        <span className="rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs text-[var(--color-warning-text)]">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm tabular-nums text-[var(--color-text-secondary)]">
                      {priceText}
                      {isWeightType(service.serviceType) && service.servicePrice > 0
                        ? ` + ${formatRupiah(service.servicePrice)} biaya tambahan`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => edit(service)}
                      className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(service)}
                      disabled={isPending}
                      className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text)] disabled:opacity-60"
                    >
                      {service.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
