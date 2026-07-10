"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSimpleCashFlowAction, deleteSimpleCashFlowAction } from "@/app/(app)/simple/uang/actions";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

export type SimpleCashFlowRow = {
  id: string;
  outletName: string;
  type: "IN" | "OUT";
  category: string;
  amount: number;
  note: string | null;
  spentAt: string;
};

export function SimpleCashflowForm({
  outlets,
  flows,
}: {
  outlets: { id: string; name: string }[];
  flows: SimpleCashFlowRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"IN" | "OUT">("OUT");
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Operasional");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!outletId) return setError("Pilih outlet dulu.");
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return setError("Nominal harus lebih dari nol.");

    startTransition(async () => {
      const result = await createSimpleCashFlowAction({
        outletId,
        type,
        amount: parsedAmount,
        category: category.trim() || (type === "IN" ? "Uang Masuk" : "Uang Keluar"),
        note: note.trim() || undefined,
      });
      if (result.succeeded) {
        setAmount("");
        setNote("");
        setError(null);
        router.refresh();
      } else {
        setError(result.message ?? "Gagal mencatat uang.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteSimpleCashFlowAction(id);
      if (result.succeeded) router.refresh();
      else setError(result.message ?? "Gagal menghapus catatan.");
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submit} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Catat Uang</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-[var(--color-bg)] p-1">
          {(["OUT", "IN"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setType(value);
                setCategory(value === "IN" ? "Tambahan Modal" : "Operasional");
              }}
              className={`min-h-[42px] rounded-md text-sm font-bold ${
                type === value ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--color-text)]"
              }`}
            >
              {value === "IN" ? "Uang Masuk" : "Uang Keluar"}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-xs font-bold text-[var(--color-text-secondary)]">
          Outlet
          <select
            value={outletId}
            onChange={(event) => setOutletId(event.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
          >
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
          Nominal
          <input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
            placeholder="Contoh: 25000"
            className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
          Kategori
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
          Catatan
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Opsional"
            className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
          />
        </label>
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <button
          disabled={isPending}
          className="mt-4 min-h-[46px] w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-[var(--color-on-primary)] disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Riwayat 7 Hari</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {flows.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-text-secondary)]">Belum ada catatan uang.</p>
          ) : (
            flows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--color-text)]">{flow.category}</p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {flow.outletName} · {formatTanggalPendek(flow.spentAt)}
                    {flow.note ? ` · ${flow.note}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-mono-data text-sm font-bold ${flow.type === "IN" ? "text-emerald-600" : "text-red-600"}`}>
                    {flow.type === "IN" ? "+" : "-"}
                    {formatRupiah(flow.amount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(flow.id)}
                    className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
