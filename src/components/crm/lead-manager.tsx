"use client";

import { useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { createLeadAction, updateLeadAction, deleteLeadAction } from "@/app/(app)/crm/actions";

export type LeadRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  interest: string | null;
  expectedValue: number;
  nextFollowUpAt: string | null;
  status: "NEW" | "CONTACTED" | "WON" | "LOST";
  notes: string | null;
  createdAt: string;
};

interface LeadManagerProps {
  leads: LeadRow[];
}

export function LeadManager({ leads }: LeadManagerProps) {
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [interest, setInterest] = useState("");
  const [expectedValue, setExpectedValue] = useState<number>(0);
  const [nextFollowUpAtStr, setNextFollowUpAtStr] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"NEW" | "CONTACTED" | "WON" | "LOST">("NEW");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const totalLeads = leads.length;
  const wonValue = leads
    .filter((l) => l.status === "WON")
    .reduce((acc, l) => acc + l.expectedValue, 0);
  const potentialValue = leads
    .filter((l) => l.status !== "LOST" && l.status !== "WON")
    .reduce((acc, l) => acc + l.expectedValue, 0);

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Nama prospek wajib diisi.");

    setLoading(true);
    setError(null);

    const result = await createLeadAction({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      source: source.trim() || undefined,
      interest: interest.trim() || undefined,
      expectedValue,
      nextFollowUpAtStr: nextFollowUpAtStr || undefined,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (result.succeeded) {
      setShowAddModal(false);
      setName("");
      setPhone("");
      setEmail("");
      setSource("");
      setInterest("");
      setExpectedValue(0);
      setNextFollowUpAtStr("");
      setNotes("");
    } else {
      setError(result.message || "Gagal membuat prospek.");
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLead || !name.trim()) return;

    setLoading(true);
    setError(null);

    const result = await updateLeadAction(selectedLead.id, {
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      source: source.trim() || undefined,
      interest: interest.trim() || undefined,
      expectedValue,
      nextFollowUpAtStr: nextFollowUpAtStr || undefined,
      status,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (result.succeeded) {
      setShowEditModal(false);
      setSelectedLead(null);
    } else {
      setError(result.message || "Gagal memperbarui prospek.");
    }
  }

  async function handleDelete(leadId: string) {
    if (!confirm("Hapus data prospek ini?")) return;

    setLoading(true);
    const result = await deleteLeadAction(leadId);
    setLoading(false);

    if (result.succeeded) {
      setShowEditModal(false);
      setSelectedLead(null);
    } else {
      alert(result.message || "Gagal menghapus prospek.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Lead Aktif</span>
          <h3 className="text-2xl font-bold font-mono-data mt-2">{totalLeads} Prospek</h3>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Nilai Transaksi Deal (WON)</span>
          <h3 className="text-2xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400 mt-2">
            {formatRupiah(wonValue)}
          </h3>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Potensi Pipeline Aktif</span>
          <h3 className="text-2xl font-bold font-mono-data text-blue-600 dark:text-blue-400 mt-2">
            {formatRupiah(potentialValue)}
          </h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Pipeline & Follow-up Pelanggan</h2>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setName("");
            setPhone("");
            setEmail("");
            setSource("");
            setInterest("");
            setExpectedValue(0);
            setNextFollowUpAtStr("");
            setNotes("");
            setShowAddModal(true);
          }}
          className="cursor-pointer min-h-[38px] rounded-xl bg-[var(--color-primary)] px-4 text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90"
        >
          + Tambah Prospek
        </button>
      </div>

      {/* Grid status columns (Kanban Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(["NEW", "CONTACTED", "WON", "LOST"] as const).map((colStatus) => {
          const colLeads = leads.filter((l) => l.status === colStatus);
          let colTitle = "Baru (New)";
          let colHeaderBg = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
          if (colStatus === "CONTACTED") {
            colTitle = "Dihubungi";
            colHeaderBg = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
          } else if (colStatus === "WON") {
            colTitle = "Berhasil (WON)";
            colHeaderBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
          } else if (colStatus === "LOST") {
            colTitle = "Gagal (LOST)";
            colHeaderBg = "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20";
          }

          return (
            <div key={colStatus} className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/45 p-3 min-h-[350px]">
              <div className={`rounded-xl border px-3 py-1.5 text-center text-xs font-bold ${colHeaderBg}`}>
                {colTitle} · {colLeads.length}
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                {colLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => {
                      setSelectedLead(lead);
                      setName(lead.name);
                      setPhone(lead.phone || "");
                      setEmail(lead.email || "");
                      setSource(lead.source || "");
                      setInterest(lead.interest || "");
                      setExpectedValue(lead.expectedValue);
                      setNextFollowUpAtStr(lead.nextFollowUpAt ? lead.nextFollowUpAt.split("T")[0] : "");
                      setNotes(lead.notes || "");
                      setStatus(lead.status);
                      setError(null);
                      setShowEditModal(true);
                    }}
                    className="cursor-pointer text-left w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <p className="font-bold text-xs text-[var(--color-text)] truncate">{lead.name}</p>
                    {lead.interest && (
                      <p className="text-[10px] text-[var(--color-text-secondary)] mt-1 font-semibold">
                        Tertarik: {lead.interest}
                      </p>
                    )}
                    {lead.expectedValue > 0 && (
                      <p className="text-[10px] font-mono-data text-red-600 dark:text-red-400 font-bold mt-1">
                        {formatRupiah(lead.expectedValue)}
                      </p>
                    )}
                    {lead.nextFollowUpAt && (
                      <div className="mt-2 text-[8px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200/50 inline-block">
                        F/Up: {formatTanggalPendek(lead.nextFollowUpAt)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[var(--color-text)]">Tambah Prospek Penjualan</h3>
            <form onSubmit={handleAddSubmit} className="mt-4 flex flex-col gap-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600 border border-red-500/20">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Nama Prospek / Kontak *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mis. Ibu Rina Catering"
                  className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    No. Telp / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rina@mail.com"
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Sumber Prospek
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Mis. Instagram, Referensi"
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Kategori Minat
                  </label>
                  <input
                    type="text"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    placeholder="Mis. Kopi Grosir, Catering"
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Estimasi Nilai Deal
                  </label>
                  <input
                    type="number"
                    value={expectedValue || ""}
                    onChange={(e) => setExpectedValue(Number(e.target.value))}
                    placeholder="Rupiah"
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono-data"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Jadwal Follow-Up
                  </label>
                  <input
                    type="date"
                    value={nextFollowUpAtStr}
                    onChange={(e) => setNextFollowUpAtStr(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Catatan Progres
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  rows={2}
                  placeholder="Isi catatan negosiasi atau follow-up..."
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
                  {loading ? "Menyimpan..." : "Simpan Prospek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text)]">Ubah Informasi Prospek</h3>
              <button
                type="button"
                onClick={() => handleDelete(selectedLead.id)}
                disabled={loading}
                className="cursor-pointer text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-40"
              >
                Hapus
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 flex flex-col gap-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600 border border-red-500/20">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Nama Prospek / Kontak *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    No. Telp / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Sumber Prospek
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Kategori Minat
                  </label>
                  <input
                    type="text"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Estimasi Nilai Deal
                  </label>
                  <input
                    type="number"
                    value={expectedValue || ""}
                    onChange={(e) => setExpectedValue(Number(e.target.value))}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono-data"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Jadwal Follow-Up
                  </label>
                  <input
                    type="date"
                    value={nextFollowUpAtStr}
                    onChange={(e) => setNextFollowUpAtStr(e.target.value)}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                    Status Pipeline *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "NEW" | "CONTACTED" | "WON" | "LOST")}
                    className="w-full min-h-[38px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-bold text-[var(--color-text)]"
                  >
                    <option value="NEW">NEW (Baru)</option>
                    <option value="CONTACTED">CONTACTED (Dihubungi)</option>
                    <option value="WON">WON (Berhasil)</option>
                    <option value="LOST">LOST (Gagal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-1">
                  Catatan Progres
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer min-h-[38px] flex-1 sm:flex-initial px-4 rounded-xl bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)] transition-all hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
