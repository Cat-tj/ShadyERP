"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { formatRupiah } from "@/lib/format";
import { buildDynamicQris } from "@/lib/qris-dynamic";
import { createSaleAction, type CreateSalePayload } from "@/app/(app)/kasir/actions";
import { queueSale } from "@/lib/offline-queue";
import { MemberPicker, type MemberOption } from "@/components/kasir/member-picker";
import { XIcon } from "@/components/ui/icons";

const QUICK_CASH = [20000, 50000, 100000];
const STATIC_QRIS_STORAGE_KEY = "altora-static-qris-placeholder";

const PAYMENT_METHODS: { value: CreateSalePayload["paymentMethod"]; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "QRIS", label: "QRIS" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "EWALLET", label: "E-Wallet" },
  { value: "DEPOSIT", label: "Saldo" },
];

export function PaymentSheet({
  total,
  items,
  discountAmount,
  onClose,
  onSuccess,
}: {
  total: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  items: { productId: string; qty: number; discountAmount: number; variantOptionIds?: string[] }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<CreateSalePayload["paymentMethod"]>("CASH");
  const [amountInput, setAmountInput] = useState("");
  const [member, setMember] = useState<MemberOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [staticQris, setStaticQris] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(STATIC_QRIS_STORAGE_KEY) ?? ""
  );
  const [qrisDataUrl, setQrisDataUrl] = useState<string | null>(null);
  const [qrisError, setQrisError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const amountPaid = method === "CASH" ? Number(amountInput) || 0 : total;
  const change = method === "CASH" ? Math.max(0, amountPaid - total) : 0;
  const isCashInsufficient = method === "CASH" && amountPaid < total;
  const isDepositInsufficient = method === "DEPOSIT" && (!member || member.depositBalance < total);
  const isQrisUnavailable = method === "QRIS" && (!staticQris.trim() || !qrisDataUrl || Boolean(qrisError));

  useEffect(() => {
    let cancelled = false;

    async function generateQris() {
      if (method !== "QRIS") {
        setQrisDataUrl(null);
        setQrisError(null);
        return;
      }
      if (!staticQris.trim()) {
        setQrisDataUrl(null);
        setQrisError("Tempel payload QRIS statis usaha dulu. Nanti bisa diganti QRIS asli kamu.");
        return;
      }

      try {
        const dynamicPayload = buildDynamicQris(staticQris, total);
        const dataUrl = await QRCode.toDataURL(dynamicPayload, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 7,
        });
        if (!cancelled) {
          setQrisDataUrl(dataUrl);
          setQrisError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setQrisDataUrl(null);
          setQrisError(err instanceof Error ? err.message : "Gagal membuat QRIS dinamis.");
        }
      }
    }

    generateQris();
    return () => {
      cancelled = true;
    };
  }, [method, staticQris, total]);

  function saveStaticQris(value: string) {
    setStaticQris(value);
    localStorage.setItem(STATIC_QRIS_STORAGE_KEY, value);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload: CreateSalePayload = {
        items,
        discountAmount,
        paymentMethod: method,
        amountPaid,
        memberId: member?.id ?? null,
      };

      try {
        const result = await createSaleAction(payload);
        if (result.error) {
          setError(result.error);
          return;
        }
        onSuccess();
        router.push(`/kasir/struk/${result.saleId}`);
      } catch {
        // Panggilan ke server gagal total (bukan error validasi/stok dari
        // server) — kemungkinan besar sedang offline.
        if (method === "DEPOSIT") {
          setError(
            "Sedang offline — bayar pakai saldo deposit tidak bisa diantre, pilih metode lain dulu."
          );
          return;
        }
        await queueSale(payload);
        setQueuedOffline(true);
      }
    });
  }

  if (queuedOffline) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
        <div className="w-full rounded-t-2xl bg-[var(--color-bg)] p-6 text-center sm:max-w-sm sm:rounded-2xl">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-2xl">
            📶
          </div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Tersimpan offline
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Internet sedang terputus. Transaksi {formatRupiah(total)} disimpan di HP ini dan akan
            otomatis dikirim & dicatat begitu koneksi kembali.
          </p>
          <button
            onClick={() => {
              onSuccess();
            }}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)]"
          >
            Transaksi baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--color-bg)] p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Pembayaran</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Total belanja</p>
          <p className="tabular-nums text-3xl font-bold text-[var(--color-text)]">{formatRupiah(total)}</p>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">Member (opsional)</p>
          <MemberPicker value={member} onChange={setMember} />
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">Metode pembayaran</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((option) => {
              const disabled = option.value === "DEPOSIT" && !member;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setMethod(option.value);
                    setAmountInput("");
                  }}
                  disabled={disabled}
                  className={`min-h-[48px] rounded-lg border text-xs font-medium disabled:opacity-40 ${
                    method === option.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {method === "DEPOSIT" && !member && (
            <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
              Pilih member dulu untuk bayar pakai saldo.
            </p>
          )}
        </div>

        {method === "CASH" ? (
          <div className="mt-4">
            <label htmlFor="amountPaid" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Uang diterima
            </label>
            <input
              id="amountPaid"
              type="number"
              inputMode="numeric"
              min={0}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="0"
              className="min-h-[52px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xl font-bold tabular-nums text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setAmountInput(String(total))}
                className="min-h-[40px] rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)]"
              >
                Uang pas
              </button>
              {QUICK_CASH.map((amount) => (
                <button
                  key={amount}
                  data-testid="quick-cash"
                  onClick={() => setAmountInput(String(amount))}
                  className="min-h-[40px] rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)]"
                >
                  {formatRupiah(amount)}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--color-surface)] px-4 py-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Kembalian</span>
              <span className="tabular-nums text-lg font-bold text-[var(--color-text)]">
                {formatRupiah(change)}
              </span>
            </div>
          </div>
        ) : method === "QRIS" ? (
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex min-h-[184px] flex-1 items-center justify-center rounded-xl bg-white p-3">
                {qrisDataUrl ? (
                  // Data URL dibuat client-side agar QRIS tetap bisa muncul saat ALTORA offline.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrisDataUrl} alt={`QRIS dinamis ${formatRupiah(total)}`} className="h-40 w-40" />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
                    QRIS dinamis muncul di sini
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">QRIS dinamis manual</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  QR dibuat dari QRIS statis usaha dan nominal transaksi. Kasir tetap perlu cek bukti
                  pembayaran lalu tekan selesai.
                </p>
                <p className="mt-3 text-xs font-medium text-[var(--color-text)]">Nominal QRIS</p>
                <p className="tabular-nums text-xl font-bold text-[var(--color-primary)]">{formatRupiah(total)}</p>
              </div>
            </div>

            <details className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <summary className="cursor-pointer text-sm font-medium text-[var(--color-text)]">
                QRIS statis usaha
              </summary>
              <textarea
                value={staticQris}
                onChange={(event) => saveStaticQris(event.target.value)}
                rows={4}
                placeholder="Placeholder: nanti tempel payload QRIS statis asli dari QR kamu di sini."
                className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-mono text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Tersimpan di device kasir ini supaya tetap bisa dipakai saat offline.
              </p>
            </details>

            {qrisError && (
              <div className="mt-3 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-xs text-[var(--color-warning-text)]">
                {qrisError}
              </div>
            )}
          </div>
        ) : method === "DEPOSIT" ? (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--color-surface)] px-4 py-3">
            <span className="text-sm text-[var(--color-text-secondary)]">Saldo {member?.name ?? "member"}</span>
            <span
              className={`tabular-nums text-lg font-bold ${
                isDepositInsufficient ? "text-[var(--color-danger)]" : "text-[var(--color-text)]"
              }`}
            >
              {formatRupiah(member?.depositBalance ?? 0)}
            </span>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Pastikan pembayaran {formatRupiah(total)} sudah diterima lewat {PAYMENT_METHODS.find((m) => m.value === method)?.label} sebelum lanjut.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || isCashInsufficient || isDepositInsufficient || isQrisUnavailable}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : `Selesaikan — ${formatRupiah(total)}`}
        </button>
      </div>
    </div>
  );
}
