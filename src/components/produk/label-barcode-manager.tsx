"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { BarcodeSvg } from "@/components/ui/barcode-svg";
import { PrintButton } from "@/components/kasir/print-button";

export type LabelProduct = { id: string; name: string; sku: string | null; price: number };

export function LabelBarcodeManager({ products, tenantName }: { products: LabelProduct[]; tenantName: string }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, string>>({});

  const withSku = useMemo(() => products.filter((p) => p.sku && p.sku.trim()), [products]);
  const withoutSkuCount = products.length - withSku.length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return withSku;
    return withSku.filter(
      (p) => p.name.toLowerCase().includes(query) || (p.sku ?? "").toLowerCase().includes(query)
    );
  }, [withSku, search]);

  const selectedProducts = withSku.filter((p) => selected[p.id]);
  const selectedCount = selectedProducts.length;

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleAll() {
    const allSelected = filtered.every((p) => selected[p.id]);
    setSelected((prev) => {
      const next = { ...prev };
      for (const p of filtered) next[p.id] = !allSelected;
      return next;
    });
  }

  function qtyFor(id: string) {
    const raw = Number(qtyByProduct[id] ?? "1");
    return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 100) : 1;
  }

  // Satu entri per lembar label (produk diulang sesuai qty-nya).
  const labelSheet = selectedProducts.flatMap((p) =>
    Array.from({ length: qtyFor(p.id) }, (_, i) => ({ ...p, copyKey: `${p.id}-${i}` }))
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Label & Barcode</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Pilih produk, atur jumlah label, lalu cetak ke printer label atau kertas biasa.
          </p>
        </div>
        <Link
          href="/produk"
          className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Kembali ke Produk
        </Link>
      </div>

      {withoutSkuCount > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)] print:hidden">
          {withoutSkuCount} produk belum punya SKU/barcode, jadi tidak muncul di daftar ini. Tambahkan SKU dulu
          lewat tombol &quot;Ubah&quot; di halaman Produk (atau klik &quot;Buat SKU&quot; otomatis).
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] print:hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm outline-none focus:border-[var(--color-primary)] sm:w-72"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAll}
              className="min-h-[40px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Pilih semua yang tampil
            </button>
            <span className="text-xs text-[var(--color-text-secondary)]">{selectedCount} produk dipilih</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            Tidak ada produk yang cocok.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((product) => (
              <label
                key={product.id}
                className="flex cursor-pointer items-center gap-3 p-3 hover:bg-[var(--color-bg)]"
              >
                <input
                  type="checkbox"
                  checked={!!selected[product.id]}
                  onChange={() => toggle(product.id)}
                  className="h-5 w-5 shrink-0 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">{product.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    SKU {product.sku} · {formatRupiah(product.price)}
                  </p>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  value={qtyByProduct[product.id] ?? "1"}
                  onClick={(e) => e.preventDefault()}
                  onChange={(e) => setQtyByProduct((prev) => ({ ...prev, [product.id]: e.target.value }))}
                  className="h-9 w-16 shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-center text-xs tabular-nums outline-none focus:border-[var(--color-primary)]"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="print:hidden">
          <PrintButton label={`Cetak ${labelSheet.length} label`} fullWidth={false} />
        </div>
      )}

      {labelSheet.length > 0 && (
        <div id="print-area" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {labelSheet.map((item) => (
            <div
              key={item.copyKey}
              className="flex flex-col items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center print:break-inside-avoid"
            >
              <p className="w-full truncate text-[11px] font-semibold text-[var(--color-text)]">{tenantName}</p>
              <p className="w-full truncate text-xs font-medium text-[var(--color-text)]">{item.name}</p>
              <p className="tabular-nums text-xs font-bold text-[var(--color-primary)]">{formatRupiah(item.price)}</p>
              <BarcodeSvg value={item.sku ?? ""} height={40} width={1.4} fontSize={10} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
