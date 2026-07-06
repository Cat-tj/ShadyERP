"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { importProductsBulkAction } from "@/app/(app)/inventory/actions";
import { useToast, Toast } from "@/components/toast";
import { formatRupiah } from "@/lib/format";

type ParsedRow = {
  name: string;
  sku: string | null;
  categoryName: string | null;
  outletName: string | null;
  supplierName: string | null;
  batchNumber: string | null;
  expirationDate: string | null;
  price: number;
  cost: number | null;
  trackStock: boolean;
  trackExpiry: boolean;
  stockQty: number | null;
  reorderPoint: number | null;
  kind: "GOODS" | "SERVICE" | "NON_INVENTORY";
  isValid: boolean;
  errorMsg?: string;
};

export default function InventoryImportPage() {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  function parseCSV(text: string): ParsedRow[] {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
    
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cells = parseCsvLine(line).map((c) => c.trim().replace(/^["']|["']$/g, ""));

      // Map cells to headers
      const rowData: Record<string, string> = {};
      headers.forEach((header, idx) => {
        if (cells[idx] !== undefined) {
          rowData[header] = cells[idx];
        }
      });

      const name = rowData["name"] || rowData["nama"] || "";
      const sku = rowData["sku"] || null;
      const categoryName = rowData["category"] || rowData["kategori"] || null;
      const outletName = rowData["outlet"] || rowData["cabang"] || null;
      const supplierName = rowData["supplier"] || rowData["pemasok"] || null;
      const batchNumber = rowData["batch"] || rowData["batchnumber"] || rowData["lot"] || null;
      const expirationDate = rowData["expirationdate"] || rowData["expireddate"] || rowData["expired"] || rowData["exp"] || null;
      const priceStr = rowData["price"] || rowData["harga"] || "0";
      const costStr = rowData["cost"] || rowData["modal"] || "";
      const trackStockStr = rowData["trackstock"] || rowData["kelolastok"] || "false";
      const trackExpiryStr = rowData["trackexpiry"] || rowData["kelolaexpired"] || "";
      const stockQtyStr = rowData["stockqty"] || rowData["stok"] || "";
      const reorderPointStr = rowData["reorderpoint"] || rowData["stokminimum"] || "";
      const kindStr = (rowData["kind"] || rowData["jenis"] || "GOODS").toUpperCase();

      // Validation
      let isValid = true;
      let errorMsg = "";

      if (!name.trim()) {
        isValid = false;
        errorMsg += "Nama produk wajib diisi. ";
      }

      const parsedPrice = parseFloat(priceStr);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        isValid = false;
        errorMsg += "Harga jual harus berupa angka non-negatif. ";
      }
      const price = isNaN(parsedPrice) ? 0 : Math.round(parsedPrice);

      const parsedCost = costStr.trim() ? parseFloat(costStr) : null;
      if (parsedCost !== null && (isNaN(parsedCost) || parsedCost < 0)) {
        isValid = false;
        errorMsg += "Harga modal harus berupa angka non-negatif. ";
      }
      const cost = parsedCost === null || isNaN(parsedCost) ? null : Math.round(parsedCost);

      const trackStock = trackStockStr.toLowerCase() === "true" || trackStockStr === "1";
      const trackExpiry = trackExpiryStr
        ? trackExpiryStr.toLowerCase() === "true" || trackExpiryStr === "1"
        : Boolean(expirationDate);
      const stockQty = stockQtyStr.trim() ? parseInt(stockQtyStr, 10) : null;
      if (trackStock && stockQty !== null && (isNaN(stockQty) || stockQty < 0)) {
        isValid = false;
        errorMsg += "Jumlah stok harus berupa angka bulat non-negatif. ";
      }

      const reorderPoint = reorderPointStr.trim() ? parseInt(reorderPointStr, 10) : null;
      if (trackStock && reorderPoint !== null && (isNaN(reorderPoint) || reorderPoint < 0)) {
        isValid = false;
        errorMsg += "Stok minimum harus berupa angka bulat non-negatif. ";
      }

      let kind: ParsedRow["kind"] = "GOODS";
      if (kindStr === "SERVICE" || kindStr === "JASA") {
        kind = "SERVICE";
      } else if (kindStr === "NON_INVENTORY" || kindStr === "NON_STOK") {
        kind = "NON_INVENTORY";
      }

      rows.push({
        name,
        sku,
        categoryName,
        outletName,
        supplierName,
        batchNumber,
        expirationDate,
        price,
        cost,
        trackStock,
        trackExpiry,
        stockQty,
        reorderPoint,
        kind,
        isValid,
        errorMsg: errorMsg.trim() || undefined,
      });
    }

    return rows;
  }

  function parseCsvLine(line: string) {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      try {
        const rows = parseCSV(text);
        setParsedRows(rows);
        const invalidCount = rows.filter((r) => !r.isValid).length;
        if (invalidCount > 0) {
          setErrorSummary(`Terdapat ${invalidCount} baris data yang bermasalah. Harap perbaiki sebelum mengimpor.`);
        } else {
          setErrorSummary(null);
        }
      } catch (err) {
        setErrorSummary("Gagal memproses file CSV. Pastikan format file sesuai contoh.");
      }
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const headers = "Name,SKU,Category,Outlet,Supplier,Price,Cost,TrackStock,TrackExpiry,StockQty,ReorderPoint,Batch,ExpirationDate,Kind\n";
    const sampleRow = "Kopi Susu Gula Aren,KOPI-01,Kopi,Cabang Utama,Supplier Umum,18000,8000,true,true,50,5,BATCH-001,2026-12-31,GOODS\nKopi Hitam Toraja,KOPI-02,Kopi,Cabang Utama,Supplier Umum,15000,6000,true,false,30,5,,,GOODS\nJasa Cuci Motor,,Jasa,,,25000,,false,false,,,,,SERVICE\nPaper Bag,PB-01,Kemasan,Cabang Utama,Supplier Umum,2000,1000,false,false,,,,,NON_INVENTORY\n";
    const blob = new Blob([headers + sampleRow], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "altora_template_produk.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleConfirmImport() {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast("Tidak ada data produk valid untuk diimpor.");
      return;
    }

    startTransition(async () => {
      const result = await importProductsBulkAction(
        validRows.map((r) => ({
          name: r.name,
          sku: r.sku,
          categoryName: r.categoryName,
          outletName: r.outletName,
          supplierName: r.supplierName,
          price: r.price,
          cost: r.cost,
          trackStock: r.trackStock,
          trackExpiry: r.trackExpiry,
          stockQty: r.stockQty,
          reorderPoint: r.reorderPoint,
          batchNumber: r.batchNumber,
          expirationDate: r.expirationDate,
          kind: r.kind,
        }))
      );

      if (result.error) {
        showToast(result.error);
        return;
      }

      showToast(`Sukses mengimpor ${validRows.length} produk!`);
      router.push("/inventory");
      router.refresh();
    });
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="flex min-h-[36px] items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          ← Kembali ke Stok
        </Link>
        <h1 className="font-display text-xl font-bold text-[var(--color-text)]">Import Produk Massal (CSV)</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-base font-bold text-[var(--color-text)] mb-3">1. Upload File CSV</h2>
            
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border-2 border-dashed border-[var(--color-border)] p-6 text-center hover:bg-[var(--color-bg)] transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer">
                  <span className="block text-sm font-semibold text-[var(--color-primary)] hover:underline">
                    Pilih file CSV toko Anda
                  </span>
                  <span className="mt-1 block text-xs text-[var(--color-text-secondary)]">
                    Maksimum ukuran file 5MB · Format .csv saja · mendukung outlet, supplier, batch, expired
                  </span>
                </label>
              </div>

              <div className="flex justify-between items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex min-h-[36px] items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                >
                  Unduh Template CSV
                </button>
              </div>
            </div>
          </section>

          {parsedRows.length > 0 && (
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <h2 className="text-base font-bold text-[var(--color-text)]">
                  2. Tinjau Data Produk ({validCount} dari {parsedRows.length} valid)
                </h2>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isPending || validCount === 0}
                  className="min-h-[38px] rounded-lg bg-[var(--color-primary)] px-4 text-xs font-bold text-[var(--color-on-primary)] disabled:opacity-40"
                >
                  {isPending ? "Mengimpor..." : `Konfirmasi Import (${validCount} Produk)`}
                </button>
              </div>

              {errorSummary && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-medium">
                  {errorSummary}
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-left text-xs text-[var(--color-text)]">
                  <thead className="bg-[var(--color-bg-secondary)] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Kategori</th>
                      <th className="px-3 py-2">Outlet</th>
                      <th className="px-3 py-2">Harga Jual</th>
                      <th className="px-3 py-2">Stok</th>
                      <th className="px-3 py-2">Expired</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? "hover:bg-[var(--color-bg)]" : "bg-red-50/50"}>
                        <td className="px-3 py-2.5 font-semibold">
                          {row.name || <span className="text-red-600 font-bold">KOSONG</span>}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px]">{row.sku || "-"}</td>
                        <td className="px-3 py-2.5">{row.categoryName || "-"}</td>
                        <td className="px-3 py-2.5">{row.outletName || "Outlet pertama"}</td>
                        <td className="px-3 py-2.5 font-mono">{formatRupiah(row.price)}</td>
                        <td className="px-3 py-2.5 font-mono">
                          {row.trackStock ? `${row.stockQty ?? 0} (min ${row.reorderPoint ?? 0})` : "Non-Stok"}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px]">{row.expirationDate || "-"}</td>
                        <td className="px-3 py-2.5 text-right">
                          {row.isValid ? (
                            <span className="font-semibold text-emerald-600">Valid</span>
                          ) : (
                            <span className="font-bold text-red-600" title={row.errorMsg}>
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)] mb-3">
              Petunjuk Format CSV
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-[var(--color-text-secondary)] leading-relaxed list-disc pl-4">
              <li>
                <strong>Name / Nama (Wajib):</strong> Nama lengkap produk yang dijual.
              </li>
              <li>
                <strong>SKU (Opsional):</strong> Kode unik barcode/inventori.
              </li>
              <li>
                <strong>Category / Kategori (Opsional):</strong> Jika kategori belum ada di database, Altora akan otomatis membuatnya.
              </li>
              <li>
                <strong>Outlet / Cabang (Opsional):</strong> Nama outlet untuk stok awal. Jika kosong, masuk ke outlet pertama.
              </li>
              <li>
                <strong>Supplier / Pemasok (Opsional):</strong> Dicatat sebagai referensi impor dan dibuat jika belum ada.
              </li>
              <li>
                <strong>Price / Harga (Wajib):</strong> Angka bulat positif harga jual konsumen.
              </li>
              <li>
                <strong>Cost / Modal (Opsional):</strong> Angka modal dasar HPP.
              </li>
              <li>
                <strong>TrackStock (Opsional):</strong> Masukkan <code>true</code> jika ingin melacak jumlah stoknya, atau <code>false</code> jika tidak.
              </li>
              <li>
                <strong>TrackExpiry / ExpirationDate (Opsional):</strong> Isi tanggal <code>YYYY-MM-DD</code> untuk membuat batch awal.
              </li>
              <li>
                <strong>StockQty / Stok (Opsional):</strong> Stok awal produk (diisi jika TrackStock bernilai <code>true</code>).
              </li>
              <li>
                <strong>ReorderPoint (Opsional):</strong> Batas minimum restock.
              </li>
              <li>
                <strong>Kind / Jenis (Opsional):</strong> Pilih <code>GOODS</code> (barang), <code>SERVICE</code> (jasa), atau <code>NON_INVENTORY</code> (non-stok).
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
