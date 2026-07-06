"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TableOrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/app/(app)/pesanan-meja/actions";
import { useToast, Toast } from "@/components/toast";
import { LowStockAlert } from "@/components/inventory/low-stock-alert";
import { TableVisual } from "@/components/pengaturan/meja-manager";

export type KitchenItemRow = {
  id: string;
  productName: string;
  variantLabel: string | null;
  qty: number;
  note: string | null;
};

export type KitchenOrderRow = {
  id: string;
  status: TableOrderStatus;
  customerName: string | null;
  note: string | null;
  createdAt: string;
  tableName: string;
  outletName: string;
  items: KitchenItemRow[];
};

const REFRESH_INTERVAL_MS = 15000;
const TICK_INTERVAL_MS = 30000;
const WARN_AFTER_MIN = 5;
const URGENT_AFTER_MIN = 15;

function minutesSince(iso: string, now: number) {
  return Math.floor((now - new Date(iso).getTime()) / 60000);
}

export type ActiveStaffRow = {
  id: string;
  name: string;
  jobTitle: string;
};

export type TableItem = {
  id: string;
  name: string;
  posX: number;
  posY: number;
  isActive: boolean;
  floor: number;
  shape: string;
  capacity: number;
};

type LowStockItem = {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  deficit: number;
};

export function KitchenDisplay({
  orders,
  activeStaff = [],
  tables = [],
  lowStockItems = [],
}: {
  orders: KitchenOrderRow[];
  activeStaff?: ActiveStaffRow[];
  tables?: TableItem[];
  lowStockItems?: LowStockItem[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  const [activeFloor, setActiveFloor] = useState(1);
  const [floorCount, setFloorCount] = useState(() => Math.max(1, ...tables.map((t) => t.floor)));

  useEffect(() => {
    const refreshInterval = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    const tickInterval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
  }, [router]);

  function advance(order: KitchenOrderRow, status: TableOrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.error) {
        showToast(result.error);
        return;
      }
      router.refresh();
    });
  }

  // Group staff by jobTitle
  const staffByJob = activeStaff.reduce<Record<string, string[]>>((acc, s) => {
    const title = s.jobTitle.trim() || "Staf";
    if (!acc[title]) acc[title] = [];
    acc[title].push(s.name);
    return acc;
  }, {});

  const floors = Array.from({ length: floorCount }, (_, i) => i + 1);
  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const cookingCount = orders.filter((order) => order.status === "ACCEPTED").length;
  const readyCount = orders.filter((order) => order.status === "READY").length;
  const occupiedCount = tables.filter((table) =>
    orders.some(
      (order) =>
        order.tableName.toLowerCase() === table.name.toLowerCase() &&
        order.status !== "DONE" &&
        order.status !== "CANCELLED"
    )
  ).length;

  function resolveTableStatus(table: TableItem) {
    const order = orders.find(
      (o) =>
        o.tableName.toLowerCase() === table.name.toLowerCase() &&
        o.status !== "DONE" &&
        o.status !== "CANCELLED"
    );

    let status: "EMPTY" | "ORDERED" | "EATING" | "READY" = "EMPTY";
    if (order) {
      if (order.status === "PENDING") {
        status = "ORDERED";
      } else if (order.status === "READY") {
        status = "READY";
      } else {
        status = "EATING";
      }
    }

    return { order, status };
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-[1720px] flex-col gap-5 rounded-[28px] border border-white/70 bg-white/45 p-4 shadow-[0_24px_70px_-42px_rgba(10,31,68,0.45)] sm:p-5">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <Link
            href="/pilih-aplikasi"
            className="mt-1 flex min-h-[38px] items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs font-semibold text-[var(--color-text-secondary)] transition-all hover:bg-white"
          >
            ← Keluar Fullscreen
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Command Center</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Pusat kendali operasional live: antrean pesanan, peta meja, staf hadir, dan peringatan stok bahan baku.
            </p>
          </div>
        </div>

        {/* Panel Karyawan Aktif */}
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: "Pesanan", value: orders.length },
            { label: "Masak", value: cookingCount },
            { label: "Siap", value: readyCount },
            { label: "Meja isi", value: occupiedCount },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-20 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-center">
              <p className="tabular-nums text-lg font-bold text-[var(--color-text)]">{value}</p>
              <p className="text-[10px] font-semibold text-[var(--color-text-secondary)]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {activeStaff.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/75 p-3">
          <div className="flex flex-wrap gap-2.5">
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider w-full mb-0.5">
              Staf Hadir:
            </span>
            {Object.entries(staffByJob).map(([job, names]) => (
              <div key={job} className="text-xs bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg">
                <span className="font-bold text-[var(--color-primary)]">{job}: </span>
                <span className="text-[var(--color-text)]">{names.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="w-full rounded-2xl border border-red-200 bg-red-50/70 p-3">
          <p className="mb-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
            Peringatan Stok Kritis (Bahan Baku):
          </p>
          <LowStockAlert items={lowStockItems} />
        </div>
      )}

      {/* Unified Live Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Daftar Antrean (Queue List) */}
        <section className="lg:col-span-5 flex flex-col gap-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/82 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[var(--color-text)]">Daftar Antrean Masak</h2>
            <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
              {pendingCount} baru
            </span>
          </div>
          
          <div className="max-h-[78vh] overflow-y-auto pr-1 flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/70 px-6 py-16 text-center">
                <p className="text-sm font-semibold text-[var(--color-text)]">Tidak ada pesanan aktif</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Pesanan QR meja akan muncul di sini begitu masuk.</p>
              </div>
            ) : (
              orders.map((order) => {
                const minutes = minutesSince(order.createdAt, now);
                const isUrgent = minutes >= URGENT_AFTER_MIN;
                const isWarn = !isUrgent && minutes >= WARN_AFTER_MIN;
                return (
                  <div
                    key={order.id}
                    className={`flex flex-col gap-3 rounded-2xl border-2 bg-[var(--color-surface)] p-4 shadow-sm ${
                      isUrgent
                        ? "border-[var(--color-danger)] animate-pulse"
                        : isWarn
                          ? "border-[var(--color-warning-text)]"
                          : "border-[var(--color-border)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-[var(--color-text)]">{order.tableName}</p>
                        {order.customerName && (
                          <p className="text-xs text-[var(--color-text-secondary)]">{order.customerName}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${
                          isUrgent
                            ? "bg-[var(--color-danger)] text-white"
                            : isWarn
                              ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                              : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {minutes} mnt
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-2 text-sm">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs text-[var(--color-text)]">
                          <span className="font-bold">{item.qty}×</span> {item.productName}
                          {item.variantLabel && (
                            <span className="text-[var(--color-text-secondary)]"> · {item.variantLabel}</span>
                          )}
                          {item.note && (
                            <p className="text-[10px] italic text-[var(--color-text-secondary)]">&quot;{item.note}&quot;</p>
                          )}
                        </div>
                      ))}
                      {order.note && (
                        <p className="text-[10px] italic text-[var(--color-text-secondary)]">&quot;{order.note}&quot;</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => advance(order, "ACCEPTED")}
                          disabled={isPending}
                          className="min-h-[38px] flex-1 rounded-lg bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)] disabled:opacity-40 cursor-pointer"
                        >
                          Mulai Masak
                        </button>
                      )}
                      {order.status === "ACCEPTED" && (
                        <button
                          onClick={() => advance(order, "READY")}
                          disabled={isPending}
                          className="min-h-[38px] flex-1 rounded-lg bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)] disabled:opacity-40 cursor-pointer"
                        >
                          Siap Disajikan
                        </button>
                      )}
                      {order.status === "READY" && (
                        <div className="flex min-h-[38px] flex-1 items-center justify-center rounded-lg bg-[var(--color-bg)] text-xs font-bold text-[var(--color-primary)]">
                          Siap diantar
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Peta Layout Meja */}
        <section className="lg:col-span-7 flex flex-col gap-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/82 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[var(--color-text)]">Peta Layout Meja</h2>
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)]">
              {tables.length} meja
            </span>
          </div>

          <div className="flex justify-between items-center gap-4 flex-wrap border-b border-[var(--color-border)] pb-2">
            {/* Floor selector */}
            <div className="flex flex-wrap gap-1">
              {floors.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFloor(f)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    activeFloor === f
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  Lantai {f}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFloorCount((count) => {
                    const next = count + 1;
                    setActiveFloor(next);
                    return next;
                  });
                }}
                className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                + Lantai
              </button>
            </div>

          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-2 px-3 rounded-lg border border-[var(--color-border)]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Kosong / Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Baru Pesan (Belum Masak)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 inline-block" />
              <span>Sedang Makan / Dimasak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Tagihan / Siap Sajikan</span>
            </div>
          </div>

          <div
            className="relative w-full h-[500px] rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)]/70 p-4 shadow-inner overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            {tables
              .filter((t) => t.floor === activeFloor)
              .map((table) => {
                const { order, status } = resolveTableStatus(table);
                const leftPercent = table.posX < 15 ? table.posX * 8 : table.posX;
                const topPercent = table.posY < 15 ? table.posY * 8 : table.posY;

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => {
                      if (order) {
                        const itemsStr = order.items
                          .map((item) => `${item.qty}x ${item.productName}`)
                          .join(", ");
                        showToast(`${table.name}: ${itemsStr}`);
                      } else {
                        showToast(`${table.name} sedang kosong.`);
                      }
                    }}
                    style={{
                      position: "absolute",
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      transform: "translate(-50%, -50%)",
                      touchAction: "none",
                    }}
                    className="cursor-pointer outline-none hover:scale-105 transition-transform duration-150"
                  >
                    <TableVisual
                      name={table.name}
                      shape={table.shape}
                      capacity={table.capacity}
                      isActive={table.isActive}
                      isHovered={false}
                      status={status}
                    />
                  </button>
                );
              })}
          </div>
        </section>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
