import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const [outletCount, productCount, staffCount, setting] = await Promise.all([
    prisma.outlet.count({ where: { tenantId: user.tenantId } }),
    prisma.product.count({ where: { tenantId: user.tenantId, isActive: true } }),
    prisma.user.count({ where: { tenantId: user.tenantId, isActive: true } }),
    prisma.tenantSetting.findUnique({ where: { tenantId: user.tenantId } }),
  ]);

  const steps = [
    {
      title: "Profil bisnis & mode Altora",
      body: "Pilih Cafe, Toko, Laundry, Counter, atau Company. Atur pajak, poin, dan QRIS.",
      href: "/pengaturan/bisnis",
      done: Boolean(setting),
    },
    {
      title: "Outlet pertama",
      body: "Buat cabang/outlet agar stok, kasir, dan shift punya lokasi.",
      href: "/pengaturan/outlet",
      done: outletCount > 0,
    },
    {
      title: "Produk awal",
      body: "Tambah manual atau import CSV retail dengan SKU, stok, supplier, batch, dan expired.",
      href: productCount > 0 ? "/produk" : "/inventory/import",
      done: productCount > 0,
    },
    {
      title: "Staff & akses",
      body: "Tambah kasir/staff, assign outlet, dan PIN kasir bila diperlukan.",
      href: "/pengaturan/karyawan",
      done: staffCount > 1,
    },
    {
      title: "Barang masuk",
      body: "Catat stok awal/barang datang, QC, batch, dan expired date.",
      href: "/stock-receipt",
      done: false,
    },
    {
      title: "Tes transaksi",
      body: "Coba cash, QRIS, delivery, retur, koreksi bayar, lalu tutup shift.",
      href: "/kasir",
      done: false,
    },
  ];
  const doneCount = steps.filter((step) => step.done).length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Setup cepat</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--color-text)]">Onboarding Altora</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Selesaikan fondasi toko sebelum dipakai harian. Progress: {doneCount}/{steps.length}.
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
          <div className="h-full bg-[var(--color-primary)]" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <Link
            key={step.title}
            href={step.href}
            className="flex min-h-[132px] gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:bg-white/70"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                step.done ? "bg-emerald-100 text-emerald-700" : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
              }`}
            >
              {step.done ? "✓" : index + 1}
            </span>
            <span>
              <span className="block font-display text-base font-bold text-[var(--color-text)]">{step.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-[var(--color-text-secondary)]">{step.body}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
