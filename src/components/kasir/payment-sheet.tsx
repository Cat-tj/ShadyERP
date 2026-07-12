"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import { formatRupiah } from "@/lib/format";
import { buildDynamicQris } from "@/lib/qris-dynamic";
import { createSaleAction, type CreateSalePayload } from "@/app/(app)/kasir/actions";
import { lookupGiftCardAction, type LookupGiftCardResult } from "@/app/(app)/voucher/actions";
import { queueSale } from "@/lib/offline-queue";
import { MemberPicker, type MemberOption } from "@/components/kasir/member-picker";
import { XIcon } from "@/components/ui/icons";
import type { OrderType } from "@prisma/client";

const STATIC_QRIS_STORAGE_KEY = "altora-static-qris-placeholder";

/** "Uang pas" + dua pembulatan naik yang wajar (mis. total 60.000 -> Uang pas, 70.000, 100.000). */
function quickCashOptions(total: number): number[] {
  if (total <= 0) return [20000, 50000, 100000];
  const roundUp = (value: number, step: number) => Math.ceil(value / step) * step;
  const nearTen = roundUp(total, 10000) === total ? total + 10000 : roundUp(total, 10000);
  let nearBig = roundUp(total, 50000);
  if (nearBig <= nearTen) nearBig += 50000;
  return [total, nearTen, nearBig];
}

const PAYMENT_METHODS: { value: CreateSalePayload["paymentMethod"]; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "QRIS", label: "QRIS" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "EWALLET", label: "E-Wallet" },
  { value: "DEPOSIT", label: "Saldo" },
  { value: "GIFT_CARD", label: "Voucher" },
];

/** Deposit & voucher butuh cek saldo/kode khusus, jadi gak bisa dipakai buat split payment. */
const SPLIT_PAYMENT_METHODS = PAYMENT_METHODS.filter(
  (m) => m.value !== "DEPOSIT" && m.value !== "GIFT_CARD"
);

const ORDER_MODE_OPTIONS: { value: "DINE_IN" | "TAKEAWAY" | "DELIVERY"; label: string }[] = [
  { value: "DINE_IN", label: "Dine-in" },
  { value: "TAKEAWAY", label: "Takeaway" },
  { value: "DELIVERY", label: "Delivery" },
];

const DELIVERY_CHANNELS: {
  value: OrderType;
  label: string;
  logoSrc: string;
  subtitle: string;
  color: string;
  bg: string;
  textColor?: string;
}[] = [
  { value: "COURIER", label: "Kurir Toko", logoSrc: "/delivery-logos/truck.png", subtitle: "Kurir internal", color: "#64748b", bg: "#f8fafc" },
  { value: "GOFOOD", label: "Gojek", logoSrc: "/delivery-logos/gojek.png", subtitle: "GoFood", color: "#00AA13", bg: "#ecfdf3" },
  { value: "GRABFOOD", label: "Grab", logoSrc: "/delivery-logos/grab.png", subtitle: "GrabFood", color: "#00B14F", bg: "#ecfdf5" },
  { value: "SHOPEEFOOD", label: "Shopee Food", logoSrc: "/delivery-logos/shopee-food.png", subtitle: "Shopee Food", color: "#EE4D2D", bg: "#fff7ed" },
  { value: "MAXIM", label: "Maxim", logoSrc: "/delivery-logos/maxim.png", subtitle: "Maxim", color: "#F6C600", bg: "#fffbeb", textColor: "#181818" },
  { value: "DELIVERY_OTHER", label: "Lainnya", logoSrc: "/delivery-logos/truck.png", subtitle: "Channel lain", color: "#334155", bg: "#f8fafc" },
];

export type StampProgramSettings = {
  enabled: boolean;
  target: number;
  rewardName: string | null;
  rewardValue: number;
};

export function PaymentSheet({
  total,
  items,
  discountAmount,
  staticQrisPayload,
  stampProgram,
  channelMarkupByOrderType,
  initialMember,
  onClose,
  onSuccess,
}: {
  total: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  items: {
    productId: string;
    qty: number;
    discountAmount: number;
    variantOptionIds?: string[];
    isFavoritePick?: boolean;
  }[];
  staticQrisPayload: string | null;
  stampProgram: StampProgramSettings;
  channelMarkupByOrderType: Partial<Record<OrderType, number>>;
  /** Member yang udah dipilih sebelumnya di layar kasir (mis. buat lihat menu favorit) — biar gak perlu cari ulang di sini. */
  initialMember?: MemberOption | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<CreateSalePayload["paymentMethod"]>("CASH");
  const [splitMode, setSplitMode] = useState(false);
  const [splitMethodA, setSplitMethodA] = useState<CreateSalePayload["paymentMethod"]>("CASH");
  const [splitMethodB, setSplitMethodB] = useState<CreateSalePayload["paymentMethod"]>("QRIS");
  const [splitAmountAInput, setSplitAmountAInput] = useState("");
  const [orderMode, setOrderMode] = useState<"DINE_IN" | "TAKEAWAY" | "DELIVERY">("DINE_IN");
  const [deliveryChannel, setDeliveryChannel] = useState<OrderType>("GOFOOD");
  const [amountInput, setAmountInput] = useState("");
  const [member, setMember] = useState<MemberOption | null>(initialMember ?? null);
  const [redeemStamp, setRedeemStamp] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardLookup, setGiftCardLookup] = useState<LookupGiftCardResult | null>(null);
  const [giftCardChecking, setGiftCardChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [staticQris, setStaticQris] = useState(() =>
    staticQrisPayload ??
    (typeof window === "undefined" ? "" : localStorage.getItem(STATIC_QRIS_STORAGE_KEY) ?? "")
  );
  const [qrisDataUrl, setQrisDataUrl] = useState<string | null>(null);
  const [qrisError, setQrisError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [, startGiftCardTransition] = useTransition();

  const canRedeemStamp = Boolean(
    stampProgram.enabled && member && member.stampCount >= stampProgram.target
  );
  const selectedOrderType: OrderType = orderMode === "DELIVERY" ? deliveryChannel : orderMode;
  const channelMarkupPercent = channelMarkupByOrderType[selectedOrderType] ?? 0;

  const stampAdjustedTotal =
    canRedeemStamp && redeemStamp ? Math.max(0, total - stampProgram.rewardValue) : total;
  const channelMarkupAmount = Math.round((stampAdjustedTotal * channelMarkupPercent) / 100);
  const effectiveTotal = stampAdjustedTotal + channelMarkupAmount;
  const hasTotalAdjustment = effectiveTotal !== total;

  const splitAmountA = Math.min(Number(splitAmountAInput) || 0, effectiveTotal);
  const splitAmountB = Math.max(0, effectiveTotal - splitAmountA);
  const isSplitInvalid =
    splitMode &&
    (splitAmountAInput === "" ||
      splitAmountA <= 0 ||
      splitAmountA >= effectiveTotal ||
      splitMethodA === splitMethodB);

  const amountPaid = method === "CASH" ? Number(amountInput) || 0 : effectiveTotal;
  const change = method === "CASH" ? Math.max(0, amountPaid - effectiveTotal) : 0;
  const isCashInsufficient = method === "CASH" && amountPaid < effectiveTotal;
  const isDepositInsufficient =
    method === "DEPOSIT" && (!member || member.depositBalance < effectiveTotal);
  const isQrisUnavailable = method === "QRIS" && (!staticQris.trim() || !qrisDataUrl || Boolean(qrisError));
  const isGiftCardInsufficient =
    method === "GIFT_CARD" &&
    (!giftCardLookup ||
      Boolean(giftCardLookup.error) ||
      giftCardLookup.status !== "ACTIVE" ||
      (giftCardLookup.balance ?? 0) < effectiveTotal);

  useEffect(() => {
    if (!canRedeemStamp) setRedeemStamp(false);
  }, [canRedeemStamp]);

  function checkGiftCard() {
    const code = giftCardCode.trim();
    if (!code) {
      setGiftCardLookup(null);
      return;
    }
    setGiftCardChecking(true);
    startGiftCardTransition(async () => {
      const result = await lookupGiftCardAction(code);
      setGiftCardLookup(result);
      setGiftCardChecking(false);
    });
  }

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
        setQrisError("QRIS usaha belum disimpan. Scan QRIS di Pengaturan > Bisnis dulu.");
        return;
      }

      try {
        const dynamicPayload = buildDynamicQris(staticQris, effectiveTotal);
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
  }, [method, staticQris, effectiveTotal]);

  function saveStaticQris(value: string) {
    setStaticQris(value);
    localStorage.setItem(STATIC_QRIS_STORAGE_KEY, value);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload: CreateSalePayload = splitMode
        ? {
            items,
            discountAmount,
            paymentMethod: splitAmountA >= splitAmountB ? splitMethodA : splitMethodB,
            orderType: selectedOrderType,
            amountPaid: effectiveTotal,
            memberId: member?.id ?? null,
            redeemStamp: canRedeemStamp && redeemStamp,
            splitPayments: [
              { method: splitMethodA, amount: splitAmountA },
              { method: splitMethodB, amount: splitAmountB },
            ],
          }
        : {
            items,
            discountAmount,
            paymentMethod: method,
            orderType: selectedOrderType,
            amountPaid,
            memberId: member?.id ?? null,
            redeemStamp: canRedeemStamp && redeemStamp,
            giftCardCode: method === "GIFT_CARD" ? giftCardCode.trim() : undefined,
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
        if (!splitMode && method === "DEPOSIT") {
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
            Internet sedang terputus. Transaksi {formatRupiah(effectiveTotal)} disimpan di HP ini dan akan
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

  const formBody = (
    <>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
        <p className="text-xs text-[var(--color-text-secondary)]">Total belanja</p>
        {hasTotalAdjustment ? (
          <>
            <p className="truncate tabular-nums text-sm font-medium text-[var(--color-text-secondary)] line-through">
              {formatRupiah(total)}
            </p>
            <p
              className={`truncate tabular-nums text-2xl font-bold ${
                effectiveTotal < total ? "text-[var(--color-success)]" : "text-[var(--color-text)]"
              }`}
            >
              {formatRupiah(effectiveTotal)}
            </p>
            {channelMarkupAmount > 0 && (
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                Termasuk markup {selectedOrderType} {channelMarkupPercent}%
              </p>
            )}
          </>
        ) : (
          <p className="truncate tabular-nums text-2xl font-bold text-[var(--color-text)]">
            {formatRupiah(effectiveTotal)}
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">Jenis pesanan</p>
        <div className="grid grid-cols-3 gap-2">
          {ORDER_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setOrderMode(option.value)}
              className={`min-h-[44px] rounded-lg border text-xs font-semibold sm:text-sm ${
                orderMode === option.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {orderMode === "DELIVERY" && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-bold tracking-normal text-[var(--color-text-secondary)]">
              Channel Delivery
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DELIVERY_CHANNELS.map((channel) => {
                const active = deliveryChannel === channel.value;
                return (
                  <button
                    key={channel.value}
                    type="button"
                    onClick={() => setDeliveryChannel(channel.value)}
                    className={`flex min-h-[64px] items-center gap-3 rounded-xl border px-3 text-left transition-all active:scale-[0.98] ${
                      active
                        ? "border-[var(--color-primary)] bg-[var(--color-surface)] shadow-sm"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <DeliveryLogo channel={channel} active={active} />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[var(--color-text)]">{channel.label}</span>
                      <span className="block text-[10px] text-[var(--color-text-secondary)] truncate">
                        {channel.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">Metode pembayaran</p>
          <button
            type="button"
            onClick={() => setSplitMode(!splitMode)}
            className="text-xs font-semibold text-[var(--color-primary)]"
          >
            {splitMode ? "Bayar 1 metode saja" : "Bayar 2 metode (split)"}
          </button>
        </div>

        {splitMode ? (
          <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <div className="flex items-center gap-2">
              <select
                value={splitMethodA}
                onChange={(e) => setSplitMethodA(e.target.value as CreateSalePayload["paymentMethod"])}
                className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                {SPLIT_PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">
                  Rp
                </span>
                <input
                  id="splitAmountA"
                  type="number"
                  inputMode="numeric"
                  value={splitAmountAInput}
                  onChange={(e) => setSplitAmountAInput(e.target.value)}
                  placeholder="0"
                  className="min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-8 pr-2 text-sm tabular-nums text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={splitMethodB}
                onChange={(e) => setSplitMethodB(e.target.value as CreateSalePayload["paymentMethod"])}
                className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                {SPLIT_PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="flex min-h-[44px] flex-1 items-center rounded-lg bg-[var(--color-bg)] px-3 text-sm tabular-nums font-medium text-[var(--color-text-secondary)]">
                {formatRupiah(splitAmountB)}
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Sisa tagihan otomatis masuk ke metode kedua. Jumlah keduanya harus pas {formatRupiah(effectiveTotal)}.
            </p>
            {splitMode && splitMethodA === splitMethodB && (
              <p className="text-xs font-medium text-[var(--color-danger)]">Pilih 2 metode yang beda.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`min-h-[44px] rounded-lg border text-xs font-semibold sm:text-sm ${
                  method === m.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <MemberPicker value={member} onChange={setMember} />
      </div>

      {stampProgram.enabled && member && (
        <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          {canRedeemStamp ? (
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--color-text)]">
                🎉 {member.name} punya {member.stampCount} stempel — tukar jadi{" "}
                <span className="font-semibold">{stampProgram.rewardName ?? "reward gratis"}</span>{" "}
                (hemat {formatRupiah(stampProgram.rewardValue)})
              </span>
              <input
                type="checkbox"
                checked={redeemStamp}
                onChange={(e) => setRedeemStamp(e.target.checked)}
                className="h-5 w-5 shrink-0 accent-[var(--color-primary)]"
              />
            </label>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">
              Stempel {member.name}: {member.stampCount}/{stampProgram.target}
            </p>
          )}
        </div>
      )}

      {splitMode ? null : method === "CASH" ? (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">Uang diterima</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {quickCashOptions(effectiveTotal).map((val, index) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountInput(String(val))}
                className={`min-h-[44px] rounded-lg border text-sm font-semibold transition-colors ${
                  amountInput === String(val)
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                }`}
              >
                {index === 0 ? "Uang pas" : formatRupiah(val)}
              </button>
            ))}
          </div>
          <div className="relative mt-3 flex items-center">
            <span className="absolute left-4 text-sm text-[var(--color-text-secondary)] font-medium">Rp</span>
            <input
              type="number"
              inputMode="numeric"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="Masukkan nominal"
              className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-sm">
            <span className="text-[var(--color-text-secondary)]">Kembalian</span>
            <span className="font-bold tabular-nums text-[var(--color-success)]">{formatRupiah(change)}</span>
          </div>
          {isCashInsufficient && amountInput !== "" && (
            <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">
              Uang diterima kurang dari total belanja.
            </p>
          )}
        </div>
      ) : method === "QRIS" ? (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          {isQrisUnavailable ? (
            <p className="text-xs text-[var(--color-danger)] font-medium">
              Payload QRIS statis belum diset di pengaturan outlet / pengaturan bisnis.
            </p>
          ) : (
            <div className="mx-auto flex flex-col items-center">
              {qrisDataUrl && (
                <div className="relative h-48 w-48 overflow-hidden rounded-xl border p-2 bg-white">
                  <Image
                    src={qrisDataUrl}
                    alt="QRIS Code"
                    fill
                    sizes="192px"
                    className="object-contain"
                    priority
                  />
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--color-text-secondary)] font-medium">
                Scan kode QRIS di atas untuk membayar {formatRupiah(effectiveTotal)}
              </p>
            </div>
          )}

          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs font-semibold text-[var(--color-primary)]">
              Atur payload QRIS statis manual
            </summary>
            <textarea
              value={staticQris}
              onChange={(event) => saveStaticQris(event.target.value)}
              rows={4}
              placeholder="Scan QRIS di Pengaturan > Bisnis, atau tempel payload QRIS statis di sini."
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
      ) : method === "GIFT_CARD" ? (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">Kode voucher</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={giftCardCode}
              onChange={(event) => {
                setGiftCardCode(event.target.value.toUpperCase());
                setGiftCardLookup(null);
              }}
              onBlur={checkGiftCard}
              placeholder="GC-XXXX-XXXX"
              className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 font-mono text-sm outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="button"
              onClick={checkGiftCard}
              disabled={giftCardChecking || !giftCardCode.trim()}
              className="rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] disabled:opacity-40"
            >
              {giftCardChecking ? "Cek..." : "Cek"}
            </button>
          </div>
          {giftCardLookup && (
            <p
              className={`mt-2 text-sm ${
                giftCardLookup.error || isGiftCardInsufficient
                  ? "text-[var(--color-danger)]"
                  : "text-[var(--color-good-text)]"
              }`}
            >
              {giftCardLookup.error
                ? giftCardLookup.error
                : giftCardLookup.status !== "ACTIVE"
                  ? "Voucher ini sudah tidak aktif."
                  : `Saldo voucher: ${formatRupiah(giftCardLookup.balance ?? 0)}`}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
          Pastikan pembayaran {formatRupiah(effectiveTotal)} sudah diterima lewat {PAYMENT_METHODS.find((m) => m.value === method)?.label} sebelum lanjut.
        </p>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto scrollbar-none bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-modal)] rounded-t-3xl sm:max-w-md sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--color-border)]/50">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Pembayaran</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {formBody}
          {error && (
            <div className="mt-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-t border-[var(--color-border)]/50">
          <button
            onClick={handleSubmit}
            disabled={
              isPending ||
              (splitMode
                ? isSplitInvalid
                : isCashInsufficient || isDepositInsufficient || isQrisUnavailable || isGiftCardInsufficient)
            }
            className="flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-primary)] px-3 text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            {isPending && (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
            )}
            {isPending ? (
              "Menyimpan..."
            ) : (
              <>
                <span>Selesaikan Transaksi</span>
                <span className="truncate tabular-nums">• {formatRupiah(effectiveTotal)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeliveryLogo({
  channel,
  active,
}: {
  channel: (typeof DELIVERY_CHANNELS)[number];
  active: boolean;
}) {
  const hasSolidBrandBackground =
    channel.value === "GOFOOD" || channel.value === "SHOPEEFOOD" || channel.value === "MAXIM";

  return (
    <span
      className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm"
      style={{
        borderColor: active ? channel.color : `${channel.color}55`,
        backgroundColor: hasSolidBrandBackground ? channel.bg : "var(--color-surface)",
      }}
      aria-hidden
    >
      <Image
        src={channel.logoSrc}
        alt=""
        width={90}
        height={40}
        className="h-8 w-14 object-contain"
      />
    </span>
  );
}
