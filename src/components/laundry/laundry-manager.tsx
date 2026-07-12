"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LaundryOrderStatus, LaundryServiceType, PaymentMethod } from "@prisma/client";
import { createLaundryOrderAction, updateLaundryStatusAction, addLaundryPaymentAction } from "@/app/(app)/laundry/actions";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { useToast, Toast } from "@/components/toast";

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "QRIS", label: "QRIS" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "EWALLET", label: "E-Wallet" },
];

export type LaundryOrderRow = {
  id: string;
  orderNumber: string;
  outletName: string;
  customerName: string;
  customerPhone: string | null;
  memberName: string | null;
  serviceName: string | null;
  serviceType: LaundryServiceType;
  weightGram: number | null;
  itemQty: number | null;
  total: number;
  paidAmount: number;
  dueAt: string | null;
  pickupDelivery: boolean;
  status: LaundryOrderStatus;
};

export type LaundryOutletOption = { id: string; name: string };
export type LaundryServiceOption = {
  id: string;
  name: string;
  serviceType: LaundryServiceType;
  pricePerKg: number | null;
  servicePrice: number;
};

const STATUS_LABEL: Record<LaundryOrderStatus, string> = {
  RECEIVED: "Diterima",
  WASHING: "Dicuci",
  DRYING: "Dikeringkan",
  IRONING: "Disetrika",
  READY: "Siap ambil",
  PICKED_UP: "Selesai",
  CANCELLED: "Batal",
};

const SERVICE_TYPE_LABEL: Record<LaundryServiceType, string> = {
  KILOAN: "Kiloan",
  EXPRESS: "Express",
  SATUAN: "Satuan",
  DRY_CLEAN: "Dry clean",
  SETRIKA: "Setrika",
};

const NEXT_STATUS: Partial<Record<LaundryOrderStatus, LaundryOrderStatus>> = {
  RECEIVED: "WASHING",
  WASHING: "DRYING",
  DRYING: "IRONING",
  IRONING: "READY",
  READY: "PICKED_UP",
};

export function LaundryManager({
  outlets,
  services,
  orders,
}: {
  outlets: LaundryOutletOption[];
  services: LaundryServiceOption[];
  orders: LaundryOrderRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const selectedService = services.find((service) => service.id === serviceId) ?? services[0] ?? null;
  const serviceType = selectedService?.serviceType ?? "KILOAN";
  const [weightKg, setWeightKg] = useState("1");
  const [itemQty, setItemQty] = useState("1");
  const [pricePerKg, setPricePerKg] = useState(
    services[0]?.pricePerKg !== null && services[0]?.pricePerKg !== undefined
      ? String(services[0].pricePerKg)
      : "0"
  );
  const [servicePrice, setServicePrice] = useState(String(services[0]?.servicePrice ?? 0));
  const [extraFee, setExtraFee] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [dueAt, setDueAt] = useState("");
  const [pickupDelivery, setPickupDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("CASH");

  function selectService(nextServiceId: string) {
    setServiceId(nextServiceId);
    const next = services.find((service) => service.id === nextServiceId);
    if (!next) return;
    setPricePerKg(next.pricePerKg !== null ? String(next.pricePerKg) : "0");
    setServicePrice(String(next.servicePrice));
  }

  const total = useMemo(() => {
    const kiloTotal =
      serviceType === "KILOAN" || serviceType === "EXPRESS"
        ? Math.round((Number(weightKg) || 0) * (Number(pricePerKg) || 0))
        : 0;
    const itemTotal =
      serviceType === "KILOAN" || serviceType === "EXPRESS"
        ? Number(servicePrice) || 0
        : (Number(servicePrice) || 0) * Math.max(1, Number(itemQty) || 1);
    return Math.max(0, kiloTotal + itemTotal + (Number(extraFee) || 0) - (Number(discountAmount) || 0));
  }, [discountAmount, extraFee, itemQty, pricePerKg, servicePrice, serviceType, weightKg]);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createLaundryOrderAction({
        outletId,
        customerName,
        customerPhone: customerPhone || null,
        laundryServiceId: selectedService?.id ?? null,
        serviceType,
        weightGram: serviceType === "KILOAN" || serviceType === "EXPRESS" ? Math.round((Number(weightKg) || 0) * 1000) : null,
        itemQty: serviceType === "KILOAN" || serviceType === "EXPRESS" ? null : Math.max(1, Number(itemQty) || 1),
        pricePerKg: serviceType === "KILOAN" || serviceType === "EXPRESS" ? Number(pricePerKg) || 0 : null,
        servicePrice: Number(servicePrice) || 0,
        extraFee: Number(extraFee) || 0,
        discountAmount: Number(discountAmount) || 0,
        paidAmount: Number(paidAmount) || 0,
        dueAt: dueAt ? new Date(dueAt) : null,
        pickupDelivery,
        deliveryAddress: pickupDelivery ? deliveryAddress : null,
        note: note || null,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Order laundry dibuat");
      setCustomerName("");
      setCustomerPhone("");
      setNote("");
      router.refresh();
    });
  }

  function advance(id: string, status: LaundryOrderStatus) {
    startTransition(async () => {
      const result = await updateLaundryStatusAction(id, status);
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
      const result = await addLaundryPaymentAction(id, amount, payMethod);
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
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Laundry</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Buat order kiloan/satuan, pantau proses cucian, pickup, delivery, dan pembayaran.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-bold text-[var(--color-text)]">Order baru</h2>
          {error && <div className="mt-3 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">{error}</div>}
          <div className="mt-4 grid gap-3">
            <select value={outletId} onChange={(event) => setOutletId(event.target.value)} className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm">
              {outlets.map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}
            </select>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama pelanggan" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="No. HP pelanggan" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <select value={serviceId} onChange={(event) => selectService(event.target.value)} className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm">
              {services.length === 0 ? (
                <option value="">Belum ada layanan aktif</option>
              ) : (
                services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))
              )}
            </select>
            <div className="grid grid-cols-2 gap-2">
              {(serviceType === "KILOAN" || serviceType === "EXPRESS") ? (
                <>
                  <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Kg" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
                  <input type="number" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="Harga/kg" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
                </>
              ) : (
                <>
                  <input type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)} placeholder="Jumlah item" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
                  <input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Harga/item" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
                </>
              )}
            </div>
            {(serviceType === "KILOAN" || serviceType === "EXPRESS") && (
              <input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Biaya layanan tambahan" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            )}
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={extraFee} onChange={(e) => setExtraFee(e.target.value)} placeholder="Biaya ekstra" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
              <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="Diskon" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            </div>
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input type="checkbox" checked={pickupDelivery} onChange={(e) => setPickupDelivery(e.target.checked)} className="h-5 w-5" />
              Pickup / delivery
            </label>
            {pickupDelivery && <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Alamat pickup/delivery" rows={2} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />}
            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="DP (opsional, bisa 0 dulu)" className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan, mis. noda, parfum, urgent" rows={2} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" />
            <div className="rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm">
              Total estimasi: <span className="font-bold text-[var(--color-primary)]">{formatRupiah(total)}</span>
            </div>
            <button onClick={submit} disabled={isPending || services.length === 0} className="min-h-[48px] rounded-lg bg-[var(--color-primary)] text-sm font-bold text-[var(--color-on-primary)] disabled:opacity-50">
              {isPending ? "Menyimpan..." : "Buat order"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-[var(--color-text-secondary)]">Belum ada order laundry.</div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {orders.map((order) => {
                const next = NEXT_STATUS[order.status];
                return (
                  <div key={order.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
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
                        {STATUS_LABEL[order.status]} · {order.serviceName ?? SERVICE_TYPE_LABEL[order.serviceType] ?? order.serviceType} · {order.outletName} · {order.weightGram ? `${order.weightGram / 1000} kg` : `${order.itemQty ?? 1} item`} · {order.dueAt ? `Due ${formatTanggalPendek(order.dueAt)}` : "Tanpa due date"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        Bayar {formatRupiah(order.paidAmount)} / {formatRupiah(order.total)}
                        {order.paidAmount < order.total && order.status !== "CANCELLED" ? (
                          <span className="ml-1 font-semibold text-[var(--color-warning-text)]">
                            · Sisa {formatRupiah(order.total - order.paidAmount)}
                          </span>
                        ) : null}
                        {order.pickupDelivery ? " · Pickup/delivery" : ""}
                      </p>
                      {payingOrderId === order.id && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-[var(--color-bg)] p-2">
                          <input
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder={`Maks ${order.total - order.paidAmount}`}
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
                      {order.paidAmount < order.total && order.status !== "CANCELLED" && payingOrderId !== order.id && (
                        <button
                          onClick={() => { setPayingOrderId(order.id); setPayAmount(String(order.total - order.paidAmount)); }}
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
                      {order.status !== "CANCELLED" && order.status !== "PICKED_UP" && (
                        <button onClick={() => advance(order.id, "CANCELLED")} disabled={isPending} className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text)] disabled:opacity-50">
                          Batal
                        </button>
                      )}
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
