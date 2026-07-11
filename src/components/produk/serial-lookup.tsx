"use client";

import { useState, useTransition } from "react";
import { findSerialAction, type SerialLookupResult } from "@/app/(app)/produk/serial/actions";

export function SerialLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SerialLookupResult>(null);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    if (!query.trim()) return;
    startTransition(async () => {
      const found = await findSerialAction(query);
      setResult(found);
      setSearched(true);
    });
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Cari Serial/IMEI</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Lacak status unit dan riwayat penjualannya — buat cek klaim garansi atau lacak unit terjual.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Ketik atau scan serial/IMEI"
          className="min-h-[46px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isPending}
          className="min-h-[46px] rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
        >
          {isPending ? "Mencari..." : "Cari"}
        </button>
      </div>

      {searched && !isPending && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {!result ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Serial/IMEI "{query}" tidak ditemukan di sistem.
            </p>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Produk</span>
                <span className="font-semibold text-[var(--color-text)]">{result.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Serial/IMEI</span>
                <span className="font-mono-data font-semibold text-[var(--color-text)]">{result.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Status</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    result.status === "IN_STOCK"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {result.status === "IN_STOCK" ? `Ada di stok (${result.outletName})` : "Sudah terjual"}
                </span>
              </div>
              {result.status === "SOLD" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">No. Invoice</span>
                    <span className="font-semibold text-[var(--color-text)]">{result.saleInvoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Outlet Penjualan</span>
                    <span className="font-semibold text-[var(--color-text)]">{result.saleOutletName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Kasir</span>
                    <span className="font-semibold text-[var(--color-text)]">{result.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Tanggal Terjual</span>
                    <span className="font-semibold text-[var(--color-text)]">
                      {result.soldAt ? new Date(result.soldAt).toLocaleDateString("id-ID") : "-"}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
