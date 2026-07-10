"use client";

import { useState } from "react";
import type { VariantGroupType } from "@prisma/client";
import { formatRupiah } from "@/lib/format";
import { XIcon } from "@/components/ui/icons";

export type VariantOptionOption = { id: string; name: string; priceDelta: number };
export type VariantGroupOption = {
  id: string;
  name: string;
  type: VariantGroupType;
  required: boolean;
  options: VariantOptionOption[];
};

export function VariantPickerModal({
  productName,
  basePrice,
  groups,
  onClose,
  onConfirm,
}: {
  productName: string;
  basePrice: number;
  groups: VariantGroupOption[];
  onClose: () => void;
  onConfirm: (result: { optionIds: string[]; priceDelta: number; label: string | null }) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  function toggle(group: VariantGroupOption, optionId: string) {
    setSelected((prev) => {
      const current = prev[group.id] ?? [];
      if (group.type === "SINGLE") {
        return { ...prev, [group.id]: current.includes(optionId) ? [] : [optionId] };
      }
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [group.id]: next };
    });
  }

  const allOptionIds = Object.values(selected).flat();
  const priceDelta = groups
    .flatMap((group) => group.options)
    .filter((option) => allOptionIds.includes(option.id))
    .reduce((sum, option) => sum + option.priceDelta, 0);

  function confirm() {
    for (const group of groups) {
      if (group.required && (selected[group.id] ?? []).length === 0) {
        setError(`Pilih ${group.name} dulu.`);
        return;
      }
    }
    const label = groups
      .flatMap((group) => group.options)
      .filter((option) => allOptionIds.includes(option.id))
      .map((option) => option.name)
      .join(", ");
    onConfirm({ optionIds: allOptionIds, priceDelta, label: label || null });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[85vh] w-full overflow-y-auto scrollbar-none rounded-t-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-modal)] sm:max-w-md sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--color-border)]/50">
          <h2 className="text-lg font-bold text-[var(--color-text)]">{productName}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.id}>
              <p className="mb-1.5 text-sm font-semibold text-[var(--color-text)]">
                {group.name}
                {group.required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
              </p>
              <div className="flex flex-col gap-1.5">
                {group.options.map((option) => {
                  const checked = (selected[group.id] ?? []).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggle(group, option.id)}
                      className={`flex min-h-[44px] items-center justify-between rounded-lg border px-3 text-sm transition-all ${
                        checked
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-bold shadow-sm"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                      }`}
                    >
                      <span>{option.name}</span>
                      <span className="tabular-nums text-xs text-[var(--color-text-secondary)]">
                        {option.priceDelta > 0 ? `+${formatRupiah(option.priceDelta)}` : "Rp0"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

          {error && (
            <div className="mt-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-t border-[var(--color-border)]/50">
          <button
            onClick={confirm}
            className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
          >
            Tambah — {formatRupiah(basePrice + priceDelta)}
          </button>
        </div>
      </div>
    </div>
  );
}
