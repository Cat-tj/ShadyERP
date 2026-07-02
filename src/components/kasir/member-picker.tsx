"use client";

import { useEffect, useState } from "react";

export type MemberOption = {
  id: string;
  name: string;
  phone: string;
  points: number;
  depositBalance: number;
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
            <p className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
              Member tidak ditemukan. Transaksi tetap bisa lanjut tanpa member.
            </p>
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
