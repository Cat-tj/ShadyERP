"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createTableAction,
  updateTableAction,
  toggleTableActiveAction,
} from "@/app/(app)/pengaturan/meja/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type OutletOption = { id: string; name: string };

export type TableRow = {
  id: string;
  name: string;
  outletId: string;
  outletName: string;
  isActive: boolean;
  posX: number;
  posY: number;
  floor: number;
  shape: string;
  capacity: number;
};

function TableFormModal({
  outlets,
  table,
  onClose,
  onSaved,
  defaultPos = null,
  floorOptions = [1],
}: {
  outlets: OutletOption[];
  table: TableRow | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  defaultPos?: { posX: number; posY: number; floor: number } | null;
  floorOptions?: number[];
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(table?.outletId ?? outlets[0]?.id ?? "");
  const [name, setName] = useState(table?.name ?? "");
  const [posX] = useState(table?.posX ?? defaultPos?.posX ?? 10);
  const [posY] = useState(table?.posY ?? defaultPos?.posY ?? 10);
  const [floor, setFloor] = useState(table?.floor ?? defaultPos?.floor ?? 1);
  const [shape, setShape] = useState(table?.shape ?? "SQUARE");
  const [capacity, setCapacity] = useState(table?.capacity ?? 2);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama meja wajib diisi.");
    if (!outletId) return setError("Pilih outlet terlebih dahulu.");
    if (capacity <= 0) return setError("Kapasitas meja harus lebih dari 0.");

    startTransition(async () => {
      const result = table
        ? await updateTableAction(table.id, name.trim(), posX, posY, floor, shape, capacity)
        : await createTableAction(outletId, name.trim(), posX, posY, floor, shape, capacity);

      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(table ? "Meja disimpan" : "Meja ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-t-3xl p-6 sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {table ? "Ubah meja" : "Tambah meja"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!table && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
              <select
                value={outletId}
                onChange={(event) => setOutletId(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Nama meja</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Meja 1"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Kapasitas (Orang)</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(event) => setCapacity(Number(event.target.value) || 1)}
                placeholder="4"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Lantai</label>
              <select
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {floorOptions.map((f) => (
                  <option key={f} value={f}>Lantai {f}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Bentuk Meja</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="SQUARE">Kotak (Kecil)</option>
                <option value="ROUND">Bulat (Bundar)</option>
                <option value="RECTANGLE">Panjang (Grup)</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] p-3 rounded-xl border border-[var(--color-border)]">
            ℹ️ Posisi meja dapat diatur secara presisi dengan menyeret (*drag & drop*) meja langsung pada denah visual di sebelah kanan setelah disimpan.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : "Simpan meja"}
        </button>
      </div>
    </div>
  );
}

export function getTableDisplayCode(name: string): string {
  if (name.includes("|")) {
    return name.split("|")[1].trim();
  }
  let code = name.trim();
  if (code.toLowerCase().startsWith("meja ")) {
    code = code.substring(5).trim();
  }
  if (code.toUpperCase() === "BUNDAR VVIP") return "VVIP";
  if (code.toUpperCase() === "BUNDAR VIP") return "VIP";
  return code;
}

export function TableVisual({
  name,
  shape,
  capacity,
  isActive,
  isHovered,
  status = "EMPTY",
}: {
  name: string;
  shape: string;
  capacity: number;
  isActive: boolean;
  isHovered: boolean;
  status?: "EMPTY" | "ORDERED" | "EATING" | "READY";
}) {
  const displayCode = getTableDisplayCode(name);
  const isVip = name.toUpperCase().includes("VIP");

  const seatCount = Math.max(1, Math.min(capacity, 32));
  const chairSize = 12;
  const chairGap = 6;
  const chairs: React.ReactNode[] = [];
  const plates: React.ReactNode[] = [];

  let tableWidth = 62;
  let tableHeight = 62;
  let tableLeft = chairSize + 2;
  let tableTop = chairSize + 2;
  let frameWidth = tableWidth + chairSize * 2 + 4;
  let frameHeight = tableHeight + chairSize * 2 + 4;

  function addChair(key: string, left: number, top: number, side: "top" | "right" | "bottom" | "left" | "round") {
    const radiusClass =
      side === "round"
        ? "rounded-full"
        : side === "top"
          ? "rounded-t-md"
          : side === "right"
            ? "rounded-r-md"
            : side === "bottom"
              ? "rounded-b-md"
              : "rounded-l-md";
    chairs.push(
      <span
        key={key}
        className={`absolute border border-slate-300 bg-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ${radiusClass}`}
        style={{ left, top, width: chairSize, height: chairSize }}
      />
    );
  }

  if (shape === "RECTANGLE") {
    const longSide = Math.max(1, Math.ceil(seatCount / 3));
    let remainingSeats = seatCount;
    const topSeats = Math.min(longSide, remainingSeats);
    remainingSeats -= topSeats;
    const bottomSeats = Math.min(longSide, remainingSeats);
    remainingSeats -= bottomSeats;
    const leftSeats = Math.ceil(remainingSeats / 2);
    const rightSeats = remainingSeats - leftSeats;
    const sideSeats = Math.max(leftSeats, rightSeats);
    tableWidth = Math.max(92, longSide * (chairSize + chairGap) + 28);
    tableHeight = Math.max(52, sideSeats * (chairSize + chairGap) + 28);

    for (let i = 0; i < topSeats; i++) {
      const left = ((tableWidth - chairSize) / Math.max(1, topSeats - 1)) * i;
      addChair(`top-${i}`, left, 0, "top");
      plates.push(
        <span
          key={`plate-top-${i}`}
          className="absolute h-1.5 w-3 rounded bg-slate-300 opacity-60"
          style={{ left: left - chairSize - 2, top: 4, transform: "translateX(50%)" }}
        />
      );
    }
    for (let i = 0; i < bottomSeats; i++) {
      const left = ((tableWidth - chairSize) / Math.max(1, bottomSeats - 1)) * i;
      addChair(`bottom-${i}`, left, tableHeight + chairSize + 4, "bottom");
      plates.push(
        <span
          key={`plate-bottom-${i}`}
          className="absolute h-1.5 w-3 rounded bg-slate-300 opacity-60"
          style={{ left: left - chairSize - 2, bottom: 4, transform: "translateX(50%)" }}
        />
      );
    }
    for (let i = 0; i < leftSeats; i++) {
      const top = chairSize + 2 + ((tableHeight - chairSize) / Math.max(1, leftSeats - 1)) * i;
      addChair(`left-${i}`, 0, top, "left");
      plates.push(
        <span
          key={`plate-left-${i}`}
          className="absolute h-3 w-1.5 rounded bg-slate-300 opacity-60"
          style={{ left: 4, top: top - chairSize - 2, transform: "translateY(50%)" }}
        />
      );
    }
    for (let i = 0; i < rightSeats; i++) {
      const top = chairSize + 2 + ((tableHeight - chairSize) / Math.max(1, rightSeats - 1)) * i;
      addChair(`right-${i}`, tableWidth + chairSize + 4, top, "right");
      plates.push(
        <span
          key={`plate-right-${i}`}
          className="absolute h-3 w-1.5 rounded bg-slate-300 opacity-60"
          style={{ right: 4, top: top - chairSize - 2, transform: "translateY(50%)" }}
        />
      );
    }
  } else if (shape === "ROUND") {
    const radius = Math.min(54, Math.max(30, 24 + seatCount * 1.2));
    tableWidth = Math.max(58, radius * 1.35);
    tableHeight = tableWidth;
    const center = radius + chairSize;
    frameWidth = center * 2;
    frameHeight = center * 2;
    tableLeft = center - tableWidth / 2;
    tableTop = center - tableHeight / 2;
    for (let i = 0; i < seatCount; i++) {
      const angleRad = (((360 / seatCount) * i - 90) * Math.PI) / 180;
      addChair(
        `round-${i}`,
        center + radius * Math.cos(angleRad) - chairSize / 2,
        center + radius * Math.sin(angleRad) - chairSize / 2,
        "round"
      );
      const plateRadius = radius * 0.7;
      plates.push(
        <span
          key={`plate-round-${i}`}
          className="absolute h-2 w-2 rounded-full bg-slate-300 opacity-60"
          style={{
            left: tableWidth / 2 + plateRadius * Math.cos(angleRad) - 4,
            top: tableHeight / 2 + plateRadius * Math.sin(angleRad) - 4,
          }}
        />
      );
    }
  } else {
    const perSide = [0, 0, 0, 0];
    for (let i = 0; i < seatCount; i++) perSide[i % 4] += 1;
    const maxSide = Math.max(...perSide);
    tableWidth = Math.max(62, maxSide * (chairSize + chairGap) + 16);
    tableHeight = tableWidth;

    for (let i = 0; i < perSide[0]; i++) {
      const left = ((tableWidth - chairSize) / Math.max(1, perSide[0] - 1)) * i;
      addChair(`top-${i}`, left, 0, "top");
      plates.push(
        <span
          key={`plate-top-${i}`}
          className="absolute h-1.5 w-3 rounded bg-slate-300 opacity-60"
          style={{ left: left - chairSize - 2, top: 4, transform: "translateX(50%)" }}
        />
      );
    }
    for (let i = 0; i < perSide[2]; i++) {
      const left = ((tableWidth - chairSize) / Math.max(1, perSide[2] - 1)) * i;
      addChair(`bottom-${i}`, left, tableHeight + chairSize + 4, "bottom");
      plates.push(
        <span
          key={`plate-bottom-${i}`}
          className="absolute h-1.5 w-3 rounded bg-slate-300 opacity-60"
          style={{ left: left - chairSize - 2, bottom: 4, transform: "translateX(50%)" }}
        />
      );
    }
    for (let i = 0; i < perSide[3]; i++) {
      const top = chairSize + 2 + ((tableHeight - chairSize) / Math.max(1, perSide[3] - 1)) * i;
      addChair(`left-${i}`, 0, top, "left");
      plates.push(
        <span
          key={`plate-left-${i}`}
          className="absolute h-3 w-1.5 rounded bg-slate-300 opacity-60"
          style={{ left: 4, top: top - chairSize - 2, transform: "translateY(50%)" }}
        />
      );
    }
    for (let i = 0; i < perSide[1]; i++) {
      const top = chairSize + 2 + ((tableHeight - chairSize) / Math.max(1, perSide[1] - 1)) * i;
      addChair(`right-${i}`, tableWidth + chairSize + 4, top, "right");
      plates.push(
        <span
          key={`plate-right-${i}`}
          className="absolute h-3 w-1.5 rounded bg-slate-300 opacity-60"
          style={{ right: 4, top: top - chairSize - 2, transform: "translateY(50%)" }}
        />
      );
    }
  }

  if (shape !== "ROUND") {
    frameWidth = tableWidth + chairSize * 2 + 4;
    frameHeight = tableHeight + chairSize * 2 + 4;
  }

  // Base table card styles depending on VIP or Regular
  const tierClass = isVip
    ? "border-[3px] border-amber-400 bg-amber-50/95 ring-2 ring-amber-300/40 text-amber-950"
    : "border-2 border-blue-400 bg-white ring-2 ring-blue-300/30 text-blue-950";

  // Central circle status colors:
  // EMPTY: blue/gold depending on VIP
  // ORDERED: Amber (waiting food)
  // EATING: Rose/Red (occupied)
  // READY: Emerald/Green (finished/ready pay)
  const statusColor =
    status === "ORDERED"
      ? "from-amber-400 via-amber-500 to-amber-600 shadow-amber-300/30"
      : status === "EATING"
        ? "from-rose-500 via-rose-600 to-red-600 shadow-rose-300/30"
        : status === "READY"
          ? "from-emerald-400 via-emerald-500 to-green-600 shadow-emerald-300/30"
          : isVip
            ? "from-amber-500 via-yellow-500 to-amber-600 shadow-amber-500/20"
            : "from-blue-500 via-sky-500 to-blue-600 shadow-blue-500/20";

  return (
    <div
      className="relative"
      style={{
        width: frameWidth,
        height: frameHeight,
      }}
      title={name}
    >
      {isActive && chairs}
      <div
        className={`absolute z-10 flex items-center justify-center shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all overflow-hidden ${
          shape === "ROUND" ? "rounded-full" : shape === "RECTANGLE" ? "rounded-2xl" : "rounded-xl"
        } ${isActive ? tierClass : "border border-slate-300 bg-slate-100 opacity-60"} ${
          isHovered ? "scale-105" : ""
        }`}
        style={{
          left: tableLeft,
          top: tableTop,
          width: tableWidth,
          height: tableHeight,
        }}
      >
        {/* Visual plates placement inside the table */}
        {isActive && plates}

        {/* Inner circle badge containing the display code */}
        <div
          className={`relative z-20 flex h-[38px] w-[38px] flex-col items-center justify-center rounded-full bg-gradient-to-br text-white shadow-md select-none ${statusColor}`}
        >
          <span className="text-[12px] font-black leading-none">{displayCode}</span>
          <span className="mt-0.5 text-[7px] font-bold opacity-80 leading-none">{capacity}p</span>
        </div>

        {/* Small VIP ribbon or badge for visual distinction */}
        {isVip && isActive && (
          <span className="absolute bottom-0 right-0 left-0 bg-amber-500 text-[6px] font-black text-white text-center tracking-widest uppercase py-0.5 leading-none z-30">
            VIP
          </span>
        )}
      </div>
    </div>
  );
}

export function MejaManager({ outlets, tables }: { outlets: OutletOption[]; tables: TableRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TableRow | null>(null);
  const [defaultPos, setDefaultPos] = useState<{ posX: number; posY: number; floor: number } | null>(null);
  const [activeFloor, setActiveFloor] = useState(1);
  const [floorCount, setFloorCount] = useState(() => Math.max(1, ...tables.map((t) => t.floor)));
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [draggedPos, setDraggedPos] = useState<{ x: number; y: number } | null>(null);
  const [actionMenuTable, setActionMenuTable] = useState<TableRow | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive(table: TableRow) {
    startTransition(async () => {
      const result = await toggleTableActiveAction(table.id, !table.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(table.isActive ? "Meja dinonaktifkan" : "Meja diaktifkan");
      router.refresh();
    });
  }

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>, tableId: string) {
    e.currentTarget.releasePointerCapture(e.pointerId); // Allows smooth move tracking on canvas parent
    setDraggedTableId(tableId);
    setDragStart({ x: e.clientX, y: e.clientY });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(92, Math.max(5, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(92, Math.max(5, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setDraggedPos({ x, y });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggedTableId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(92, Math.max(5, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(92, Math.max(5, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setDraggedPos({ x, y });
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!draggedTableId) return;
    const tableId = draggedTableId;
    const pos = draggedPos;
    const start = dragStart;

    setDraggedTableId(null);
    setDraggedPos(null);
    setDragStart(null);

    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Check if it was a quick click rather than a drag
    if (start) {
      const distance = Math.sqrt(Math.pow(e.clientX - start.x, 2) + Math.pow(e.clientY - start.y, 2));
      if (distance < 5) {
        setActionMenuTable(table);
        return;
      }
    }

    if (!pos) return;

    startTransition(async () => {
      const result = await updateTableAction(table.id, table.name, pos.x, pos.y, activeFloor, table.shape, table.capacity);
      if (result.error) {
        showToast(result.error);
      } else {
        showToast(`Posisi Meja ${table.name} berhasil disimpan di ${pos.x}%, ${pos.y}%`);
      }
      router.refresh();
    });
  }

  const floors = Array.from({ length: floorCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">


      {/* Connected Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Table List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[var(--color-text)]">Daftar Meja</h2>
            <button
              onClick={() => {
                setEditing(null);
                setDefaultPos(null);
                setModalOpen(true);
              }}
              disabled={outlets.length === 0}
              className="min-h-[38px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40 cursor-pointer"
            >
              + Tambah Meja
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] max-h-[75vh] overflow-y-auto">
            {tables.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Belum ada meja. Tambahkan meja pertamamu →
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {tables.map((table) => {
                  const isHovered = hoveredTableId === table.id;

                  return (
                    <div
                      key={table.id}
                      onMouseEnter={() => setHoveredTableId(table.id)}
                      onMouseLeave={() => setHoveredTableId(null)}
                      className={`flex flex-col gap-3 p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                        isHovered
                          ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20"
                          : "bg-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {table.name}
                          {!table.isActive && (
                            <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                              Nonaktif
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {table.outletName} · Lantai {table.floor} · {table.shape === "ROUND" ? "Bulat" : table.shape === "RECTANGLE" ? "Panjang" : "Kotak"} ({table.capacity}p) · Pos: {table.posX},{table.posY}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                        <Link
                          href={`/pengaturan/meja/${table.id}`}
                          className="min-h-[32px] rounded-md border border-[var(--color-border)] px-2.5 text-[10px] font-bold text-[var(--color-text)] flex items-center hover:bg-[var(--color-bg)]"
                        >
                          QR
                        </Link>
                        <button
                          onClick={() => {
                            setEditing(table);
                            setDefaultPos(null);
                            setModalOpen(true);
                          }}
                          className="min-h-[32px] rounded-md border border-[var(--color-border)] px-2.5 text-[10px] font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)] cursor-pointer"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => toggleActive(table)}
                          disabled={isPending}
                          className="min-h-[32px] rounded-md border border-[var(--color-border)] px-2.5 text-[10px] font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 cursor-pointer"
                        >
                          {table.isActive ? "Nonaktif" : "Aktif"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Visual Editor Grid */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h2 className="text-base font-bold text-[var(--color-text)]">Desain Layout Visual</h2>
          
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

            {/* Grid Size Controllers */}
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              💡 Seret (*drag*) meja untuk memposisikannya secara bebas. Klik meja untuk membuka opsi ubah nama atau aktif/nonaktif.
            </p>
          </div>

          <div
            ref={canvasRef}
            className="relative w-full h-[500px] bg-slate-50 dark:bg-zinc-900/40 border border-[var(--color-border)] rounded-3xl overflow-hidden select-none"
            style={{
              backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {tables
              .filter((t) => t.floor === activeFloor)
              .map((table) => {
                const isDragging = draggedTableId === table.id;
                const isHovered = hoveredTableId === table.id;

                const leftPercent = table.posX < 15 ? table.posX * 8 : table.posX;
                const topPercent = table.posY < 15 ? table.posY * 8 : table.posY;

                const x = isDragging && draggedPos ? draggedPos.x : leftPercent;
                const y = isDragging && draggedPos ? draggedPos.y : topPercent;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isPending}
                    onPointerDown={(e) => handlePointerDown(e, table.id)}
                    onMouseEnter={() => setHoveredTableId(table.id)}
                    onMouseLeave={() => setHoveredTableId(null)}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isDragging ? 50 : isHovered ? 30 : 10,
                      touchAction: "none",
                    }}
                    className="cursor-grab active:cursor-grabbing outline-none"
                  >
                    <TableVisual
                      name={table.name}
                      shape={table.shape}
                      capacity={table.capacity}
                      isActive={table.isActive}
                      isHovered={isHovered || isDragging}
                    />
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Action Menu Modal for Table */}
      {actionMenuTable && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-[90vh] w-full overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-t-3xl p-6 sm:max-w-xs sm:rounded-3xl text-center animate-[fadeInUp_0.15s_ease-out_forwards]">
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">
              Aksi Meja: {actionMenuTable.name}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(actionMenuTable);
                  setDefaultPos(null);
                  setModalOpen(true);
                  setActionMenuTable(null);
                }}
                className="min-h-[44px] rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] transition-all cursor-pointer hover:opacity-90"
              >
                Ubah Detail / Bentuk
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleActive(actionMenuTable);
                  setActionMenuTable(null);
                }}
                className="min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
              >
                {actionMenuTable.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button
                type="button"
                onClick={() => setActionMenuTable(null)}
                className="min-h-[44px] rounded-xl border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] mt-2 cursor-pointer hover:bg-[var(--color-bg)] transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <TableFormModal
          outlets={outlets}
          table={editing}
          defaultPos={defaultPos}
          floorOptions={floors}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
