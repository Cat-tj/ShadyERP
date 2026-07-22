"use client";

import { useEffect, useRef, useState } from "react";
import { CameraIcon, XIcon } from "@/components/ui/icons";

type DetectedBarcode = { rawValue?: string };
type BarcodeDetectorInstance = { detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

const PRODUCT_BARCODE_FORMATS = [
  "qr_code",
  "ean_13",
  "ean_8",
  "code_128",
  "code_39",
  "code_93",
  "upc_a",
  "upc_e",
  "itf",
];

export function BarcodeScannerModal({
  title = "Scan barcode produk",
  description = "Arahkan kamera ke barcode atau QR produk.",
  onDetected,
  onClose,
  onError,
  persistent = false,
}: {
  title?: string;
  description?: string;
  onDetected: (value: string) => void;
  onClose: () => void;
  /** Called once if the camera never actually starts (unsupported browser, permission denied, or busy) — lets the caller avoid showing a toggle/state as "active" when the display is really broken. */
  onError?: (message: string) => void;
  /** Keep the camera open for fast, repeated POS scanning. */
  persistent?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stoppedRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  const lastDetectedRef = useRef<{ value: string; at: number } | null>(null);
  const [message, setMessage] = useState("Menyiapkan kamera...");

  useEffect(() => {
    onDetectedRef.current = onDetected;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  }, [onClose, onDetected, onError]);

  useEffect(() => {
    let timeoutId: number | null = null;

    async function startScanner() {
      const BarcodeDetectorCtor = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
      if (!BarcodeDetectorCtor) {
        const text = "Browser ini belum mendukung scan kamera. Pakai barcode scanner fisik atau ketik SKU manual.";
        setMessage(text);
        onErrorRef.current?.(text);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new BarcodeDetectorCtor({ formats: PRODUCT_BARCODE_FORMATS });
        setMessage("Arahkan barcode ke area kamera.");

        const scan = async () => {
          if (stoppedRef.current || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            const rawValue = results[0]?.rawValue?.trim();
            if (rawValue) {
              const now = Date.now();
              const previous = lastDetectedRef.current;
              const isDuplicate = persistent && previous?.value === rawValue && now - previous.at < 1500;
              if (!isDuplicate) {
                lastDetectedRef.current = { value: rawValue, at: now };
                onDetectedRef.current(rawValue);
                if (!persistent) {
                  onCloseRef.current();
                  return;
                }
                setMessage(`Produk ${rawValue} terbaca. Siap scan berikutnya.`);
              }
            }
          } catch {
            setMessage("Belum terbaca. Coba dekatkan barcode dan pastikan cahaya cukup.");
          }
          timeoutId = window.setTimeout(scan, 250);
        };

        scan();
      } catch {
        const text = "Kamera tidak bisa dibuka. Izinkan akses kamera, atau pakai input manual.";
        setMessage(text);
        onErrorRef.current?.(text);
      }
    }

    startScanner();

    return () => {
      stoppedRef.current = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [persistent]);

  const scannerBody = (
    <>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[var(--color-text)]">{title}</h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup scanner"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
        >
          <XIcon aria-hidden className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-36 w-64 max-w-[78%] rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-56 max-w-[70%] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-primary)]/90 shadow-lg" />
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
          <CameraIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message}</p>
        </div>
      </div>
    </>
  );

  if (persistent) {
    return (
      <aside className="fixed bottom-20 left-4 z-30 w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)] sm:bottom-6 sm:left-6 sm:w-80">
        {scannerBody}
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 sm:items-center sm:justify-center">
      <div className="w-full overflow-hidden rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)] sm:max-w-md sm:rounded-2xl">
        {scannerBody}
      </div>
    </div>
  );
}
