"use client";

import { useEffect, useState } from "react";

export type MemberOption = {
  id: string;
  name: string;
  phone: string;
  points: number;
  depositBalance: number;
  stampCount: number;
};

export function MemberPicker({
  value,
  onChange,
}: {
  value: MemberOption | null;
  onChange: (member: MemberOption | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/members/search?q=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        setResults(data.members ?? []);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const visibleResults = query.trim() ? results : [];

  async function handleCreateMember() {
    setCreateError(null);
    const name = newName.trim();
    const phone = newPhone.trim();
    if (!name || !phone) {
      setCreateError("Nama dan nomor HP wajib diisi.");
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCreateError(data.error ?? "Gagal membuat member.");
        return;
      }
      onChange(data.member);
      setQuery("");
      setShowResults(false);
      setShowNewForm(false);
      setNewName("");
      setNewPhone("");
    } catch {
      setCreateError("Gagal membuat member. Coba lagi.");
    } finally {
      setIsCreating(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{value.name}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {value.phone} · {value.points} poin
          </p>
        </div>
        <button
          onClick={() => onChange(null)}
          className="text-sm font-medium text-[var(--color-primary)]"
        >
          Ganti
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setShowResults(true);
          setShowNewForm(false);
          setCreateError(null);
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Cari nama atau nomor HP member..."
        className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
      {showResults && query.trim() && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          {isSearching ? (
            <p className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">Mencari...</p>
          ) : visibleResults.length === 0 ? (
            showNewForm ? (
              <div className="p-4">
                <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  Member tidak ditemukan. Daftarkan member baru:
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Nama member"
                    autoFocus
                    className="min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(event) => setNewPhone(event.target.value)}
                    placeholder="Nomor HP"
                    className="min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                  />
                  {createError && (
                    <p className="text-xs font-medium text-[var(--color-danger)]">{createError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateMember}
                      disabled={isCreating}
                      className="min-h-[40px] flex-1 rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                    >
                      {isCreating ? "Menyimpan..." : "Simpan & pakai"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewForm(false)}
                      className="min-h-[40px] rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-text)]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Member tidak ditemukan. Transaksi tetap bisa lanjut tanpa member.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(true);
                    setNewName(/^\d+$/.test(query.trim()) ? "" : query.trim());
                    setNewPhone(/^\d+$/.test(query.trim()) ? query.trim() : "");
                  }}
                  className="mt-1.5 text-sm font-medium text-[var(--color-primary)]"
                >
                  + Daftarkan member baru
                </button>
              </div>
            )
          ) : (
            visibleResults.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  onChange(member);
                  setQuery("");
                  setShowResults(false);
                }}
                className="flex w-full flex-col items-start px-4 py-2.5 text-left hover:bg-[var(--color-bg)]"
              >
                <span className="text-sm font-medium text-[var(--color-text)]">{member.name}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {member.phone} · {member.points} poin
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
