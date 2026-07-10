"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateTenantSettingAction, exportTenantBackupAction } from "@/app/(app)/pengaturan/bisnis/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";
import { BUSINESS_MODES, type BusinessModeKey } from "@/lib/business-modes";

export function BisnisForm({
  businessType,
  taxPercent,
  pointsPerAmount,
  receiptFooter,
  staticQrisPayload,
  accountingMode = "SIMPLE",
}: {
  businessType: BusinessModeKey;
  taxPercent: number;
  pointsPerAmount: number;
  receiptFooter: string | null;
  staticQrisPayload: string | null;
  accountingMode?: "SIMPLE" | "ADVANCED";
}) {
  const { toastMessage, showToast } = useToast();
  const [mode, setMode] = useState<BusinessModeKey>(businessType);
  const [tax, setTax] = useState(String(taxPercent));
  const [points, setPoints] = useState(String(pointsPerAmount));
  const [footer, setFooter] = useState(receiptFooter ?? "");
  const [qrisPayload, setQrisPayload] = useState(staticQrisPayload ?? "");
  const [accMode, setAccMode] = useState<"SIMPLE" | "ADVANCED">(accountingMode);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);

  function handleExportBackup() {
    setExporting(true);
    startTransition(async () => {
      const result = await exportTenantBackupAction();
      setExporting(false);
      if (result.error) {
        showToast(result.error);
        return;
      }
      if (!result.data) {
        showToast("Tidak ada data untuk dibackup.");
        return;
      }

      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `altora_backup_${result.data.tenant?.slug || "data"}_${new Date().toISOString().slice(0, 10)}.json`;
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Data backup berhasil diunduh.");
    });
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await updateTenantSettingAction({
        businessType: mode,
        taxPercent: Number(tax) || 0,
        pointsPerAmount: Number(points) || 10000,
        receiptFooter: footer.trim() || null,
        staticQrisPayload: qrisPayload.trim() || null,
        accountingMode: accMode,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Pengaturan disimpan");
    });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Mode Altora</label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {BUSINESS_MODES.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setMode(option.key)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  mode === option.key
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <span className="block text-sm font-bold">{option.shortLabel}</span>
                <span className="mt-1 line-clamp-2 block text-[11px] text-[var(--color-text-secondary)]">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Mode mengatur bahasa produk dan rekomendasi modul. Modul aktif dikelola oleh Superadmin Altora.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Pajak transaksi (%)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="min-h-[48px] w-full max-w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <p className="text-xs text-[var(--color-text-secondary)]">Isi 0 kalau tidak pakai pajak.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Rasio poin member</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-secondary)]">Setiap belanja Rp</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="min-h-[48px] w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">dapat 1 poin</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Catatan kaki struk (opsional)</label>
          <textarea
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Terima kasih sudah berbelanja!"
            rows={3}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--color-text)]">QRIS usaha</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Scan QRIS statis dari kertas/sticker usaha. POS akan membuat QRIS dinamis sesuai nominal transaksi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Scan QRIS
            </button>
          </div>

          <textarea
            value={qrisPayload}
            onChange={(event) => setQrisPayload(event.target.value)}
            rows={4}
            placeholder="Payload QRIS hasil scan akan muncul di sini."
            className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-mono text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            {qrisPayload.trim()
              ? "QRIS tersimpan akan dipakai otomatis di Kasir pada metode bayar QRIS."
              : "Belum ada QRIS tersimpan."}
          </p>
        </div>

        {/* Mode Akuntansi Switcher */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 mt-2">
          <p className="text-sm font-bold text-[var(--color-text)]">Mode Pencatatan Keuangan</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Pilih bagaimana aktivitas keuangan bisnis Anda dicatat dan disajikan.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 mt-3">
            <button
              type="button"
              onClick={() => setAccMode("SIMPLE")}
              className={`rounded-xl border p-4 text-left transition-all ${
                accMode === "SIMPLE"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              }`}
            >
              <span className="block text-sm font-bold">Sederhana (Simple)</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                Buku Kas Harian ringkas (Uang Masuk & Uang Keluar). Sangat cocok untuk operasional toko retail & cafe kecil tanpa kerumitan debit-kredit.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAccMode("ADVANCED")}
              className={`rounded-xl border p-4 text-left transition-all ${
                accMode === "ADVANCED"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              }`}
            >
              <span className="block text-sm font-bold">Lanjutan (Advanced ERP)</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                Audit Jurnal Buku Besar (General Ledger). Mengaktifkan pembukuan double-entry akuntansi formal, COA, dan draf otomatis invoice.
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 mt-4">
        <p className="text-sm font-bold text-[var(--color-text)]">Backup & Ekspor Data</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Unduh salinan cadangan seluruh data penting usaha Anda (Profil, Outlet, Produk, Transaksi Penjualan, Member, dsb.) dalam format berkas JSON untuk kebutuhan keamanan atau migrasi data.
        </p>
        <button
          type="button"
          onClick={handleExportBackup}
          disabled={exporting}
          className="mt-3 flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-60"
        >
          {exporting ? "Mengekspor..." : "Unduh Backup JSON"}
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
        )}
        {isPending ? "Menyimpan..." : "Simpan pengaturan"}
      </button>

      <Toast message={toastMessage} />

      {scannerOpen && (
        <QrisScannerModal
          onClose={() => setScannerOpen(false)}
          onDetected={(payload) => {
            setQrisPayload(payload);
            setScannerOpen(false);
            showToast("QRIS berhasil discan");
          }}
        />
      )}
    </div>
  );
}

function QrisScannerModal({
  onClose,
  onDetected,
}: {
  onClose: () => void;
  onDetected: (payload: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stoppedRef = useRef(false);
  const [message, setMessage] = useState("Arahkan kamera ke QRIS statis.");

  useEffect(() => {
    stoppedRef.current = false;

    async function startScanner() {
      const BarcodeDetectorCtor = (window as unknown as {
        BarcodeDetector?: new (options: { formats: string[] }) => {
          detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
        };
      }).BarcodeDetector;

      if (!BarcodeDetectorCtor) {
        setMessage("Browser ini belum mendukung scan kamera. Upload foto QRIS atau tempel payload manual.");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage("Kamera tidak tersedia di browser ini.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
        const scan = async () => {
          if (stoppedRef.current || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const rawValue = codes[0]?.rawValue?.trim();
            if (rawValue) {
              onDetected(rawValue);
              return;
            }
          } catch {
            setMessage("Belum terbaca. Pastikan QRIS terang dan tidak blur.");
          }
          window.setTimeout(scan, 400);
        };
        scan();
      } catch {
        setMessage("Kamera tidak bisa dibuka. Cek izin kamera browser, atau upload foto QRIS.");
      }
    }

    startScanner();

    return () => {
      stoppedRef.current = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [onDetected]);

  async function handleImageFile(file: File | null) {
    if (!file) return;
    const BarcodeDetectorCtor = (window as unknown as {
      BarcodeDetector?: new (options: { formats: string[] }) => {
        detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
      };
    }).BarcodeDetector;
    if (!BarcodeDetectorCtor) {
      setMessage("Browser ini belum mendukung baca QR dari gambar. Coba scan dari Chrome/Edge terbaru.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
      const codes = await detector.detect(bitmap);
      bitmap.close();
      const rawValue = codes[0]?.rawValue?.trim();
      if (!rawValue) {
        setMessage("QR tidak terbaca dari gambar. Coba foto yang lebih jelas.");
        return;
      }
      onDetected(rawValue);
    } catch {
      setMessage("Gagal membaca gambar QRIS.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 sm:items-center sm:justify-center">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--color-bg)] p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Scan QRIS usaha</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-black">
          <video ref={videoRef} className="aspect-[3/4] w-full object-cover" muted playsInline />
        </div>

        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{message}</p>

        <label className="mt-4 flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text)]">
          Upload foto QRIS
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => handleImageFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
    </div>
  );
}
