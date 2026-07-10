"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { XIcon } from "@/components/ui/icons";

/**
 * Modal fokus-otomatis buat scan barcode fisik (scanner USB/Bluetooth berperilaku
 * sebagai keyboard: ketik cepat lalu Enter). Sama polanya dengan pos-screen.tsx.
 * Lookup (produk ketemu/tidak) jadi tanggung jawab parent lewat onScan.
 */
export function ScanBarcodeModal({
  onScan,
  onClose,
}: {
  onScan: (sku: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const query = value.trim();
    if (!query) return;
    event.preventDefault();
    onScan(query);
    setValue("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-modal)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Scan barcode</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
          Arahkan scanner ke barcode produk. Kalau sudah kenal, langsung buka form ubah. Kalau belum, form tambah
          produk baru akan kebuka dengan SKU terisi otomatis.
        </p>
        <input
          id="scan-barcode-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Menunggu scan..."
          className="min-h-[52px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}
