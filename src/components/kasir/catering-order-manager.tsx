"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CateringOrderStatus, PaymentMethod } from "@prisma/client";
import {
  createCateringOrderAction,
  updateCateringOrderStatusAction,
  addCateringPaymentAction,
} from "@/app/(app)/pesanan-katering/actions";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { useToast, Toast } from "@/components/toast";

export type CateringOutletOption = { id: string; name: string };
export type CateringProductOption = { id: string; name: string; price: number };
export type CateringOrderItemRow = {
  id: string;
  productName: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};
export type CateringOrderRow = {
  id: string;
  orderNumber: string;
  outletName: string;
  customerName: string;
  customerPhone: string | null;
  memberName: string | null;
  eventName: string | null;
  eventAddress: string | null;
  eventDate: string | null;
  total: number;
  paidAmount: number;
  operationalCost: number | null;
  status: CateringOrderStatus;
  note: string | null;
  items: CateringOrderItemRow[];
};

const STATUS_LABEL: Record<CateringOrderStatus, string> = {
  PENDING: "Menunggu konfirmasi",
  CONFIRMED: "Terkonfirmasi",
  DONE: "Selesai",
  CANCELLED: "Batal",
};

const NEXT_STATUS: Partial<Record<CateringOrderStatus, CateringOrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "DONE",
};

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "QRIS", label: "QRIS" },
  { value: "EWALLET", label: "E-Wallet" },
];

type DraftItem = { productId: string; qty: string; unitPrice: string };

export function CateringOrderManager({
  outlets,
  products,
  orders,
}: {
  outlets: CateringOutletOption[];
  products: CateringProductOption[];
  orders: CateringOrderRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [operationalCost, setOperationalCost] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [note, setNote] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([
    { productId: products[0]?.id ?? "", qty: "1", unitPrice: products[0] ? String(products[0].price) : "0" },
  ]);
  const [error, setError] = useState<string | null>(null);

  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("CASH");

  const total = useMemo(
    () => draftItems.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0),
    [draftItems]
  );

  function addDraftItem() {
    setDraftItems((prev) => [...prev, { productId: products[0]?.id ?? "", qty: "1", unitPrice: products[0] ? String(products[0].price) : "0" }]);
  }

  function removeDraftItem(index: number) {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDraftItem(index: number, patch: Partial<DraftItem>) {
    setDraftItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function selectProductForItem(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateDraftItem(index, { productId, unitPrice: product ? String(product.price) : "0" });
  }

  function submit() {
    setError(null);
    if (!customerName.trim()) return setError("Nama pemesan wajib diisi.");
    if (draftItems.length === 0) return setError("Tambahkan minimal 1 produk.");

    startTransition(async () => {
      const result = await createCateringOrderAction({
        outletId,
        customerName,
        customerPhone: customerPhone || null,
        eventName: eventName || null,
        eventAddress: eventAddress || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        items: draftItems.map((item) => ({
          productId: item.productId,
          qty: Number(item.qty) || 0,
          unitPrice: Number(item.unitPrice) || 0,
        })),
        operationalCost: operationalCost ? Number(operationalCost) : null,
        paidAmount: paidAmount ? Number(paidAmount) : 0,
        note: note || null,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Pesanan katering dibuat");
      setCustomerName("");
      setCustomerPhone("");
      setEventName("");
      setEventAddress("");
      setEventDate("");
      setOperationalCost("");
      setPaidAmount("");
      setNote("");
      setDraftItems([{ productId: products[0]?.id ?? "", qty: "1", unitPrice: products[0] ? String(products[0].price) : "0" }]);
      router.refresh();
    });
  }

  function advance(id: string, status: CateringOrderStatus) {
    startTransition(async () => {
      const result = await updateCateringOrderStatusAction(id, status);
      if (result.error) {
        showToast(result.error);
        return;
      }
      router.refresh();
    });
  }

  function recordPayment(id: string) {
    const amount = Number(payAmount) || 0;
    if (amount <= 0) {
      showToast("Jumlah bayar harus lebih dari 0.");
      return;
    }
    startTransition(async () => {
      const result = await addCateringPaymentAction(id, amount, payMethod);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Pembayaran dicatat");
      setPayingOrderId(null);
      setPayAmount("");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Pesanan Katering</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Pesanan besar buat acara pihak lain (mis. suplai 1000 gelas kopi) — harga per item bisa custom, beda dari harga di kasir.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-bold text-[var(--color-text)]">Pesanan baru</h2>
          {error && <div className="mt-3 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">{error}</div>}
          <div className="mt-4 grid gap-3">
            <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm">
              {outlets.map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}
            </select>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama pemesan" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="No. HP pemesan (opsional)" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Nama acara (opsional)" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <input value={eventAddress} onChange={(e) => setEventAddress(e.target.value)} placeholder="Alamat acara (opsional)" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />

            <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-sm font-medium text-[var(--color-text)]">Item pesanan</p>
              {draftItems.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_60px_90px_28px] items-center gap-1.5">
                  <select
                    value={item.productId}
                    onChange={(e) => selectProductForItem(index, e.target.value)}
                    className="min-h-[40px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
                  >
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateDraftItem(index, { qty: e.target.value })}
                    placeholder="Qty"
                    className="min-h-[40px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
                  />
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateDraftItem(index, { unitPrice: e.target.value })}
                    placeholder="Harga satuan"
                    className="min-h-[40px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeDraftItem(index)}
                    disabled={draftItems.length === 1}
                    className="flex min-h-[40px] items-center justify-center rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] disabled:opacity-30"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addDraftItem} className="mt-1 text-xs font-semibold text-[var(--color-primary)]">
                + Tambah item
              </button>
            </div>

            <input type="number" value={operationalCost} onChange={(e) => setOperationalCost(e.target.value)} placeholder="Biaya operasional (opsional, mis. transport)" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            {Number(operationalCost) > 0 && (
              <p className="-mt-2 text-xs text-[var(--color-text-secondary)]">Otomatis dicatat sebagai pengeluaran outlet ini.</p>
            )}
            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="DP (opsional, bisa 0 dulu)" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan" rows={2} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />

            <div className="rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm">
              Total pesanan: <span className="font-bold text-[var(--color-primary)]">{formatRupiah(total)}</span>
            </div>
            <button onClick={submit} disabled={isPending || products.length === 0} className="min-h-[48px] rounded-lg bg-[var(--color-primary)] text-sm font-bold text-[var(--color-on-primary)] disabled:opacity-50">
              {isPending ? "Menyimpan..." : "Buat pesanan"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-[var(--color-text-secondary)]">Belum ada pesanan katering.</div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {orders.map((order) => {
                const next = NEXT_STATUS[order.status];
                const remaining = order.total - order.paidAmount;
                return (
                  <div key={order.id} className="flex flex-col gap-3 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-[var(--color-text)]">
                            {order.orderNumber} · {order.customerName}
                          </p>
                          {order.memberName && (
                            <span className="shrink-0 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                              Member: {order.memberName}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {STATUS_LABEL[order.status]} · {order.outletName}
                          {order.eventName ? ` · ${order.eventName}` : ""}
                          {order.eventDate ? ` · ${formatTanggalPendek(order.eventDate)}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          {order.items.map((item) => `${item.qty}x ${item.productName}`).join(", ")}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          Bayar {formatRupiah(order.paidAmount)} / {formatRupiah(order.total)}
                          {remaining > 0 && order.status !== "CANCELLED" ? (
                            <span className="ml-1 font-semibold text-[var(--color-warning-text)]">
                              · Sisa {formatRupiah(remaining)}
                            </span>
                          ) : null}
                        </p>
                        {payingOrderId === order.id && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-[var(--color-bg)] p-2">
                            <input
                              type="number"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              placeholder={`Maks ${remaining}`}
                              className="min-h-[36px] w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
                            />
                            <select
                              value={payMethod}
                              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                              className="min-h-[36px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
                            >
                              {PAYMENT_METHOD_OPTIONS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                              ))}
                            </select>
                            <button onClick={() => recordPayment(order.id)} disabled={isPending} className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-bold text-[var(--color-on-primary)] disabled:opacity-50">
                              Simpan
                            </button>
                            <button onClick={() => { setPayingOrderId(null); setPayAmount(""); }} className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text)]">
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/pesanan-katering/nota/${order.id}`}
                          target="_blank"
                          className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text)] flex items-center justify-center"
                        >
                          Cetak nota
                        </Link>
                        {remaining > 0 && order.status !== "CANCELLED" && payingOrderId !== order.id && (
                          <button
                            onClick={() => { setPayingOrderId(order.id); setPayAmount(String(remaining)); }}
                            className="min-h-[36px] rounded-lg border border-[var(--color-primary)] px-3 text-xs font-bold text-[var(--color-primary)]"
                          >
                            + Bayar cicilan
                          </button>
                        )}
                        {next && (
                          <button onClick={() => advance(order.id, next)} disabled={isPending} className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-bold text-[var(--color-on-primary)] disabled:opacity-50">
                            {STATUS_LABEL[next]}
                          </button>
                        )}
                        {order.status !== "CANCELLED" && order.status !== "DONE" && (
                          <button onClick={() => advance(order.id, "CANCELLED")} disabled={isPending} className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text)] disabled:opacity-50">
                            Batal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Toast message={toastMessage} />
    </div>
  );
}
