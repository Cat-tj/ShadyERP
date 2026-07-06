"use client";

import { useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { createCashFlowAction, deleteCashFlowAction } from "@/app/(app)/finance/kas/actions";

export type CashFlowRow = {
  id: string;
  outletId: string;
  outletName: string;
  type: "IN" | "OUT";
  category: string;
  amount: number;
  note: string | null;
  spentAt: string;
  createdByName: string;
};

interface CashFlowManagerProps {
  outlets: { id: string; name: string }[];
  flows: CashFlowRow[];
}

const CATEGORIES_IN = ["Omset Penjualan", "Tambahan Modal", "Lain-lain"];
const CATEGORIES_OUT = ["Belanja Bahan", "Gaji Karyawan", "Sewa Tempat", "Listrik & Air", "Biaya Operasional", "Pemeliharaan Alat", "Lain-lain"];

export function CashFlowManager({ outlets, flows }: CashFlowManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [outletId, setOutletId] = useState(outlets[0]?.id || "");
  const [type, setType] = useState<"IN" | "OUT">("OUT");
  const [category, setCategory] = useState(CATEGORIES_OUT[0]);
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [spentAtStr, setSpentAtStr] = useState(new Date().toISOString().split("T")[0]);

  // Totals
  const totalIn = flows.filter((f) => f.type === "IN").reduce((acc, f) => acc + f.amount, 0);
  const totalOut = flows.filter((f) => f.type === "OUT").reduce((acc, f) => acc + f.amount, 0);
  const netCash = totalIn - totalOut;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!outletId) return setError("Pilih outlet terlebih dahulu.");
    if (amount <= 0) return setError("Nominal transaksi harus lebih besar dari nol.");

    setLoading(true);
    setError(null);

    const result = await createCashFlowAction({
      outletId,
      type,
      category,
      amount,
      note: note.trim() || undefined,
      spentAtStr,
    });

    setLoading(false);

    if (result.succeeded) {
      setShowAddModal(false);
      setAmount(0);
      setNote("");
    } else {
      setError(result.message || "Gagal mencatat transaksi.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi kas ini?")) return;

    const result = await deleteCashFlowAction(id);
    if (!result.succeeded) {
      alert(result.message || "Gagal menghapus transaksi.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Uang Masuk (Pemasukan)</span>
          <h3 className="text-2xl font-bold font-mono-data mt-2 text-emerald-600 dark:text-emerald-400">
            {formatRupiah(totalIn)}
          </h3>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Uang Keluar (Pengeluaran)</span>
          <h3 className="text-2xl font-bold font-mono-data text-red-600 dark:text-red-400 mt-2">
            {formatRupiah(totalOut)}
          </h3>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Arus Kas Bersih (Net Cash)</span>
          <h3 className={`text-2xl font-bold font-mono-data mt-2 ${netCash >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500"}`}>
            {formatRupiah(netCash)}
          </h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Mutasi Buku Kas Harian</h2>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setAmount(0);
            setNote("");
            setShowAddModal(true);
          }}
          className="cursor-pointer min-h-[38px] rounded-xl bg-[var(--color-primary)] px-4 text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90"
        >
          + Catat Uang Masuk / Keluar
        </button>
      </div>

      {/* Transactions List */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] font-bold text-[var(--color-text-secondary)]">
                <th className="p-4 w-[120px]">Tanggal</th>
                <th className="p-4 w-[150px]">Outlet</th>
                <th className="p-4 w-[140px]">Kategori</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 text-right w-[150px]">Mutasi Uang</th>
                <th className="p-4 text-center w-[80px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {flows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Belum ada transaksi kas masuk atau keluar yang dicatat.
                  </td>
                </tr>
              ) : (
                flows.map((flow) => (
                  <tr key={flow.id} className="hover:bg-[var(--color-bg)]/40 transition-colors">
                    <td className="p-4 text-[var(--color-text-secondary)]">
                      {formatTanggalPendek(flow.spentAt)}
                    </td>
                    <td className="p-4 font-semibold text-[var(--color-text)]">
                      {flow.outletName}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                        flow.type === "IN" 
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                          : "bg-red-500/10 text-red-700 dark:text-red-400"
                      }`}>
                        {flow.category}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--color-text)]">
                      <p className="font-medium">{flow.note || "-"}</p>
                      <p className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">Dicatat oleh {flow.createdByName}</p>
                    </td>
                    <td className={`p-4 text-right font-mono-data font-bold tabular-nums text-sm ${
                      flow.type === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      {flow.type === "IN" ? "+" : "-"} {formatRupiah(flow.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(flow.id)}
                        className="cursor-pointer text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cash Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[var(--color-text)]">Catat Aliran Uang Kas</h3>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600 border border-red-500/20">
                  {error}
                </div>
              )}

              {/* Outlet Selection */}
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Outlet Cabang
                </label>
                <select
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                  className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-semibold"
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Jenis Aliran Uang
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setType("IN");
                      setCategory(CATEGORIES_IN[0]);
                    }}
                    className={`cursor-pointer min-h-[38px] rounded-xl border text-xs font-bold transition-all ${
                      type === "IN" 
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                        : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    Uang Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType("OUT");
                      setCategory(CATEGORIES_OUT[0]);
                    }}
                    className={`cursor-pointer min-h-[38px] rounded-xl border text-xs font-bold transition-all ${
                      type === "OUT" 
                        ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400" 
                        : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    Uang Keluar (-)
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-semibold"
                >
                  {(type === "IN" ? CATEGORIES_IN : CATEGORIES_OUT).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Nominal */}
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Nominal Transaksi
                  </label>
                  <input
                    type="number"
                    required
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Rupiah"
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono-data font-bold"
                  />
                </div>
                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={spentAtStr}
                    onChange={(e) => setSpentAtStr(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-semibold"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  rows={2}
                  placeholder="Mis. Belanja cup kopi, Modal awal..."
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
