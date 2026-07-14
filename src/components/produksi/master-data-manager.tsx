"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BomVersionWithItems } from "@/server/services/bom-service";
import type { RoutingVersionWithSteps } from "@/server/services/routing-service";
import type { WorkCenter } from "@prisma/client";
import {
  createWorkCenterAction,
  createBomVersionAction,
  activateBomVersionAction,
  createRoutingVersionAction,
  activateRoutingVersionAction,
} from "@/app/(app)/produksi/actions";
import { useToast, Toast } from "@/components/toast";
import { ChevronDownIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";

type Outlet = { id: string; name: string };
type Product = { id: string; name: string; price: number };

const VERSION_STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "neutral" | "primary"> = {
  DRAFT: "neutral",
  ACTIVE: "success",
  OBSOLETE: "neutral",
};
const VERSION_STATUS_LABEL: Record<string, string> = { DRAFT: "Draf", ACTIVE: "Aktif", OBSOLETE: "Usang" };

function WorkCenterSection({ outlets, workCenters }: { outlets: Outlet[]; workCenters: WorkCenter[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function add() {
    if (!name.trim()) return showToast("Nama pusat kerja wajib diisi.");
    if (!outletId) return showToast("Outlet wajib dipilih.");
    startTransition(async () => {
      const result = await createWorkCenterAction(outletId, name.trim());
      if (result.error) return showToast(result.error);
      showToast("Pusat kerja ditambahkan");
      setName("");
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="mb-1 text-sm font-semibold text-[var(--color-text)]">Pusat Kerja</h3>
      <p className="mb-3 text-xs text-[var(--color-text-secondary)]">Tempat/stasiun proses produksi berlangsung, mis. &quot;Meja Racik&quot;, &quot;Oven 1&quot;.</p>

      {workCenters.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {workCenters.map((wc) => (
            <span key={wc.id} className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-text)]">
              {wc.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className="min-h-[40px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm">
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama pusat kerja"
          className="min-h-[40px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
        />
        <button onClick={add} disabled={isPending} className="min-h-[40px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60">
          + Tambah
        </button>
      </div>
    </section>
  );
}

type BomItemDraft = { ingredientId: string; qty: number };

function BomSection({ product, products, versions }: { product: Product; products: Product[]; versions: BomVersionWithItems[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [outputQty, setOutputQty] = useState(1);
  const [items, setItems] = useState<BomItemDraft[]>([{ ingredientId: "", qty: 1 }]);
  const [isPending, startTransition] = useTransition();

  const ingredientOptions = products.filter((p) => p.id !== product.id);

  function addRow() {
    setItems([...items, { ingredientId: "", qty: 1 }]);
  }
  function updateRow(idx: number, field: keyof BomItemDraft, value: string | number) {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: field === "ingredientId" ? value : Number(value) };
    setItems(next);
  }
  function removeRow(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function createVersion() {
    const valid = items.filter((i) => i.ingredientId && i.qty > 0);
    if (valid.length === 0) return showToast("Tambahkan minimal satu bahan.");
    if (outputQty <= 0) return showToast("Jumlah hasil harus lebih dari 0.");
    startTransition(async () => {
      const result = await createBomVersionAction(product.id, outputQty, valid);
      if (result.error) return showToast(result.error);
      showToast("Versi BOM (draf) dibuat");
      setItems([{ ingredientId: "", qty: 1 }]);
      router.refresh();
    });
  }

  function activate(bomVersionId: string) {
    startTransition(async () => {
      const result = await activateBomVersionAction(bomVersionId);
      if (result.error) return showToast(result.error);
      showToast("BOM diaktifkan");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {versions.length > 0 && (
        <div className="flex flex-col gap-2">
          {versions.map((v) => (
            <div key={v.id} className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Versi {v.version} <StatusBadge variant={VERSION_STATUS_VARIANT[v.status]} className="ml-1">{VERSION_STATUS_LABEL[v.status]}</StatusBadge>
                </p>
                {v.status === "DRAFT" && (
                  <button onClick={() => activate(v.id)} disabled={isPending} className="min-h-[32px] rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] disabled:opacity-40">
                    Aktifkan
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Hasil {v.outputQty} · {v.items.length} bahan
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-[var(--color-border)] p-3">
        <p className="mb-2 text-xs font-semibold text-[var(--color-text)]">Buat versi BOM baru</p>
        <div className="mb-2 flex items-center gap-2">
          <label className="text-xs text-[var(--color-text-secondary)]">Hasil produksi per batch</label>
          <input type="number" min="1" value={outputQty} onChange={(e) => setOutputQty(Number(e.target.value))} className="min-h-[36px] w-20 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs" />
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <select value={item.ingredientId} onChange={(e) => updateRow(idx, "ingredientId", e.target.value)} className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs">
                <option value="">Pilih bahan</option>
                {ingredientOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input type="number" min="1" value={item.qty} onChange={(e) => updateRow(idx, "qty", e.target.value)} placeholder="Jumlah" className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs" />
              <button onClick={() => removeRow(idx)} className="rounded border border-[var(--color-border)] px-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg)]">
                Hapus
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={addRow} className="text-xs font-medium text-[var(--color-primary)] hover:underline">
            + Tambah bahan
          </button>
          <button onClick={createVersion} disabled={isPending} className="ml-auto min-h-[32px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-60">
            Simpan sebagai draf
          </button>
        </div>
      </div>
    </div>
  );
}

type RoutingStepDraft = { workCenterId: string; name: string; standardDurationMin?: number };

function RoutingSection({ product, workCenters, versions }: { product: Product; workCenters: WorkCenter[]; versions: RoutingVersionWithSteps[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [steps, setSteps] = useState<RoutingStepDraft[]>([{ workCenterId: "", name: "" }]);
  const [isPending, startTransition] = useTransition();
  const workCenterName = (id: string) => workCenters.find((w) => w.id === id)?.name ?? id;

  function addRow() {
    setSteps([...steps, { workCenterId: "", name: "" }]);
  }
  function updateRow(idx: number, field: keyof RoutingStepDraft, value: string | number) {
    const next = [...steps];
    next[idx] = { ...next[idx], [field]: field === "workCenterId" || field === "name" ? value : Number(value) };
    setSteps(next);
  }
  function removeRow(idx: number) {
    setSteps(steps.filter((_, i) => i !== idx));
  }

  function createVersion() {
    const valid = steps.filter((s) => s.workCenterId && s.name.trim());
    if (valid.length === 0) return showToast("Tambahkan minimal satu langkah proses.");
    startTransition(async () => {
      const result = await createRoutingVersionAction(product.id, valid);
      if (result.error) return showToast(result.error);
      showToast("Versi routing (draf) dibuat");
      setSteps([{ workCenterId: "", name: "" }]);
      router.refresh();
    });
  }

  function activate(routingVersionId: string) {
    startTransition(async () => {
      const result = await activateRoutingVersionAction(routingVersionId);
      if (result.error) return showToast(result.error);
      showToast("Routing diaktifkan");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {versions.length > 0 && (
        <div className="flex flex-col gap-2">
          {versions.map((v) => (
            <div key={v.id} className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Versi {v.version} <StatusBadge variant={VERSION_STATUS_VARIANT[v.status]} className="ml-1">{VERSION_STATUS_LABEL[v.status]}</StatusBadge>
                </p>
                {v.status === "DRAFT" && (
                  <button onClick={() => activate(v.id)} disabled={isPending} className="min-h-[32px] rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] disabled:opacity-40">
                    Aktifkan
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {v.steps.map((s) => `${s.sequence}. ${s.name} (${workCenterName(s.workCenterId)})`).join(" → ")}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-[var(--color-border)] p-3">
        <p className="mb-2 text-xs font-semibold text-[var(--color-text)]">Buat versi routing baru</p>
        {workCenters.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)]">Tambahkan Pusat Kerja dulu di atas sebelum bisa membuat langkah proses.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-2">
                  <select value={step.workCenterId} onChange={(e) => updateRow(idx, "workCenterId", e.target.value)} className="w-40 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs">
                    <option value="">Pusat kerja</option>
                    {workCenters.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <input value={step.name} onChange={(e) => updateRow(idx, "name", e.target.value)} placeholder="Nama langkah, mis. Racik" className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs" />
                  <input type="number" min="0" value={step.standardDurationMin ?? ""} onChange={(e) => updateRow(idx, "standardDurationMin", e.target.value)} placeholder="Menit" className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs" />
                  <button onClick={() => removeRow(idx)} className="rounded border border-[var(--color-border)] px-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg)]">
                    Hapus
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={addRow} className="text-xs font-medium text-[var(--color-primary)] hover:underline">
                + Tambah langkah
              </button>
              <button onClick={createVersion} disabled={isPending} className="ml-auto min-h-[32px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-60">
                Simpan sebagai draf
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function MasterDataManager({
  outlets,
  products,
  workCenters,
  bomVersions,
  routingVersions,
}: {
  outlets: Outlet[];
  products: Product[];
  workCenters: WorkCenter[];
  bomVersions: BomVersionWithItems[];
  routingVersions: RoutingVersionWithSteps[];
}) {
  const { toastMessage } = useToast();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const product = products.find((p) => p.id === productId);

  const productBoms = useMemo(() => bomVersions.filter((b) => b.productId === productId), [bomVersions, productId]);
  const productRoutings = useMemo(() => routingVersions.filter((r) => r.productId === productId), [routingVersions, productId]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/produksi" className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
        <ChevronDownIcon aria-hidden className="h-4 w-4 rotate-90" />
        Kembali ke daftar Work Order
      </Link>

      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Data Produksi</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Atur pusat kerja, resep (BOM), dan alur proses (routing) sebelum bisa membuat Work Order.
        </p>
      </div>

      <WorkCenterSection outlets={outlets} workCenters={workCenters} />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Resep &amp; Alur Proses per Produk</h3>
        {products.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Belum ada produk. Tambahkan produk dulu di halaman Inventory.</p>
        ) : (
          <>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="mb-4 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm sm:w-64">
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {product && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Resep (BOM)</h4>
                  <BomSection product={product} products={products} versions={productBoms} />
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Alur Proses (Routing)</h4>
                  <RoutingSection product={product} workCenters={workCenters} versions={productRoutings} />
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Toast message={toastMessage} />
    </div>
  );
}
