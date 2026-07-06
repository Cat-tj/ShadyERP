"use client";

import { useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { recordSupplierPaymentAction, createManualSupplierInvoiceAction } from "@/app/(app)/finance/hutang-supplier/actions";

export type SupplierInvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  total: number;
  paidAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID" | "VOIDED";
  notes: string | null;
  supplier: {
    name: string;
  };
};

type SupplierOption = {
  id: string;
  name: string;
};

interface SupplierDebtManagerProps {
  invoices: SupplierInvoiceRow[];
  suppliers: SupplierOption[];
}

export function SupplierDebtManager({ invoices, suppliers }: SupplierDebtManagerProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoiceRow | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);

  // Form states for Payment
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Form states for manual invoice
  const [newInvoiceSupplierId, setNewInvoiceSupplierId] = useState<string>("");
  const [newInvoiceNumber, setNewInvoiceNumber] = useState<string>("");
  const [newInvoiceDate, setNewInvoiceDate] = useState<string>("");
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState<string>("");
  const [newInvoiceTotal, setNewInvoiceTotal] = useState<number>(0);
  const [newInvoiceNotes, setNewInvoiceNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stats calculation
  const totalDebt = invoices
    .filter((inv) => inv.status !== "PAID" && inv.status !== "VOIDED")
    .reduce((acc, inv) => acc + (inv.total - inv.paidAmount), 0);

  const unpaidCount = invoices.filter((inv) => inv.status === "UNPAID").length;
  const partialCount = invoices.filter((inv) => inv.status === "PARTIAL").length;

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInvoice) return;

    setLoading(true);
    setErrorMessage(null);

    const result = await recordSupplierPaymentAction({
      invoiceId: selectedInvoice.id,
      amount: paymentAmount,
      paymentMethod,
      notes: paymentNotes,
    });

    setLoading(false);

    if (result.succeeded) {
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount(0);
      setPaymentNotes("");
    } else {
      setErrorMessage(result.message || "Gagal mencatat pembayaran.");
    }
  }

  async function handleAddInvoiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newInvoiceSupplierId || !newInvoiceNumber || !newInvoiceDate || newInvoiceTotal <= 0) {
      setErrorMessage("Semua kolom wajib harus diisi dengan benar.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await createManualSupplierInvoiceAction({
      supplierId: newInvoiceSupplierId,
      invoiceNumber: newInvoiceNumber,
      invoiceDateStr: newInvoiceDate,
      dueDateStr: newInvoiceDueDate || undefined,
      total: newInvoiceTotal,
      notes: newInvoiceNotes,
    });

    setLoading(false);

    if (result.succeeded) {
      setShowAddInvoiceModal(false);
      setNewInvoiceSupplierId("");
      setNewInvoiceNumber("");
      setNewInvoiceDate("");
      setNewInvoiceDueDate("");
      setNewInvoiceTotal(0);
      setNewInvoiceNotes("");
    } else {
      setErrorMessage(result.message || "Gagal membuat invoice manual.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cards stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Belum Dibayar</span>
          <h3 className="text-2xl font-bold font-mono-data tabular-nums text-red-600 dark:text-red-400 mt-2">
            {formatRupiah(totalDebt)}
          </h3>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Tagihan Unpaid</span>
          <h3 className="text-2xl font-bold font-mono-data tabular-nums text-[var(--color-text)] mt-2">
            {unpaidCount} <span className="text-sm font-normal text-[var(--color-text-secondary)]">tagihan</span>
          </h3>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Tagihan Dicicil (Partial)</span>
          <h3 className="text-2xl font-bold font-mono-data tabular-nums text-amber-600 dark:text-amber-400 mt-2">
            {partialCount} <span className="text-sm font-normal text-[var(--color-text-secondary)]">tagihan</span>
          </h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Daftar Tagihan Supplier</h2>
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setShowAddInvoiceModal(true);
          }}
          className="cursor-pointer min-h-[38px] rounded-xl bg-[var(--color-primary)] px-4 text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90"
        >
          + Invoice Manual
        </button>
      </div>

      {/* Main List Table */}
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada invoice/tagihan supplier yang terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/40 font-semibold text-[var(--color-text-secondary)]">
                  <th className="p-4">No. Invoice</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Jatuh Tempo</th>
                  <th className="p-4 text-right">Total Tagihan</th>
                  <th className="p-4 text-right">Sudah Dibayar</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {invoices.map((inv) => {
                  const remaining = inv.total - inv.paidAmount;
                  let statusClass = "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
                  let statusLabel = "Lunas";

                  if (inv.status === "UNPAID") {
                    statusClass = "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
                    statusLabel = "Belum Bayar";
                  } else if (inv.status === "PARTIAL") {
                    statusClass = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
                    statusLabel = "Dicicil";
                  } else if (inv.status === "VOIDED") {
                    statusClass = "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20";
                    statusLabel = "Dibatalkan";
                  }

                  return (
                    <tr key={inv.id} className="hover:bg-[var(--color-bg)]/30 transition-colors">
                      <td className="p-4 font-bold text-[var(--color-text)]">
                        {inv.invoiceNumber}
                        {inv.notes && (
                          <div className="text-[10px] font-normal text-[var(--color-text-secondary)] mt-0.5 max-w-[200px] truncate">
                            {inv.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-[var(--color-text)]">{inv.supplier.name}</td>
                      <td className="p-4 text-[var(--color-text-secondary)]">
                        {formatTanggalPendek(inv.invoiceDate)}
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)]">
                        {inv.dueDate ? formatTanggalPendek(inv.dueDate) : "-"}
                      </td>
                      <td className="p-4 text-right font-semibold font-mono-data tabular-nums text-[var(--color-text)]">
                        {formatRupiah(inv.total)}
                      </td>
                      <td className="p-4 text-right font-mono-data tabular-nums text-emerald-600 dark:text-emerald-400">
                        {inv.paidAmount > 0 ? formatRupiah(inv.paidAmount) : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {inv.status !== "PAID" && inv.status !== "VOIDED" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentAmount(remaining);
                              setErrorMessage(null);
                              setShowPaymentModal(true);
                            }}
                            className="cursor-pointer px-3 py-1 bg-[var(--color-bg)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-all border border-[var(--color-border)] rounded-lg font-bold"
                          >
                            Bayar
                          </button>
                        ) : (
                          <span className="text-[var(--color-text-secondary)] text-[10px] font-medium">Selesai</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[var(--color-text)]">Catat Pembayaran Hutang</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Catat nominal cicilan atau pelunasan untuk tagihan {selectedInvoice.invoiceNumber}.
            </p>

            <form onSubmit={handlePaymentSubmit} className="mt-4 flex flex-col gap-4">
              {errorMessage && (
                <div className="rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600 border border-red-500/20">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
                  Sisa Hutang Tagihan
                </label>
                <div className="mt-1 text-sm font-bold font-mono-data tabular-nums text-red-600 dark:text-red-400">
                  {formatRupiah(selectedInvoice.total - selectedInvoice.paidAmount)}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Jumlah Pembayaran (Rupiah) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvoice.total - selectedInvoice.paidAmount}
                  value={paymentAmount || ""}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono-data"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Metode Pembayaran *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="CASH">Tunai / Cash Drawer</option>
                  <option value="BANK">Transfer Bank / Digital</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  rows={2}
                  placeholder="Mis. Bukti transfer bank BCA..."
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? "Menyimpan..." : "Simpan Pembayaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[var(--color-text)]">Buat Tagihan Supplier Manual</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Tambahkan tagihan operasional supplier secara manual jika tidak melalui alur PO otomatis.
            </p>

            <form onSubmit={handleAddInvoiceSubmit} className="mt-4 flex flex-col gap-4">
              {errorMessage && (
                <div className="rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600 border border-red-500/20">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Supplier *
                </label>
                <select
                  required
                  value={newInvoiceSupplierId}
                  onChange={(e) => setNewInvoiceSupplierId(e.target.value)}
                  className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    No. Invoice *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-1092"
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Total Tagihan *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newInvoiceTotal || ""}
                    onChange={(e) => setNewInvoiceTotal(Number(e.target.value))}
                    placeholder="Rupiah"
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono-data"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Tanggal Invoice *
                  </label>
                  <input
                    type="date"
                    required
                    value={newInvoiceDate}
                    onChange={(e) => setNewInvoiceDate(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={newInvoiceDueDate}
                    onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Catatan
                </label>
                <textarea
                  value={newInvoiceNotes}
                  onChange={(e) => setNewInvoiceNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  rows={2}
                  placeholder="Deskripsi tagihan barang..."
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? "Memproses..." : "Buat Tagihan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
