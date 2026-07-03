"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseCategory } from "@prisma/client";
import { createExpenseAction, deleteExpenseAction } from "@/app/(app)/pengeluaran/actions";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_OPTIONS } from "@/lib/expense-labels";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { TrashIcon, XIcon } from "@/components/ui/icons";
import { useToast, Toast } from "@/components/toast";

export type OutletOption = { id: string; name: string };

export type ExpenseRow = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  note: string | null;
  spentAt: string;
  outletName: string;
  createdByName: string;
};

export function PengeluaranManager({
  outlets,
  expenses,
}: {
  outlets: OutletOption[];
  expenses: ExpenseRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    startTransition(async () => {
      const result = await deleteExpenseAction(id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Pengeluaran dihapus");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)]"
        >
          + Catat pengeluaran
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {expenses.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada pengeluaran tercatat di periode ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {EXPENSE_CATEGORY_LABELS[expense.category]}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {expense.outletName} · oleh {expense.createdByName} · {formatTanggalPendek(expense.spentAt)}
                  </p>
                  {expense.note && (
                    <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">
                      &quot;{expense.note}&quot;
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="tabular-nums text-sm font-bold text-[var(--color-danger)]">
                    -{formatRupiah(expense.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={isPending}
                    aria-label="Hapus pengeluaran"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] disabled:opacity-40"
                  >
                    <TrashIcon aria-hidden className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <ExpenseFormModal
          outlets={outlets}
          onClose={() => setModalOpen(false)}
          onSaved={(message) => {
            showToast(message);
            router.refresh();
          }}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}

function ExpenseFormModal({
  outlets,
  onClose,
  onSaved,
}: {
  outlets: OutletOption[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORY_OPTIONS[0].value);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [spentAt, setSpentAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    const amountNumber = Number(amount);
    if (!outletId) {
      setError("Pilih outlet terlebih dahulu.");
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Jumlah pengeluaran tidak valid.");
      return;
    }

    startTransition(async () => {
      const result = await createExpenseAction({
        outletId,
        category,
        amount: amountNumber,
        note: note.trim() || undefined,
        spentAt,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Pengeluaran dicatat");
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Catat pengeluaran</h2>
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
          {outlets.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
              <select
                value={outletId}
                onChange={(event) => setOutletId(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Kategori</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jumlah</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Tanggal</label>
              <input
                type="date"
                value={spentAt}
                onChange={(event) => setSpentAt(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="mis. bayar listrik bulan Juli"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : "Simpan pengeluaran"}
        </button>
      </div>
    </div>
  );
}
