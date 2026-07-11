"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TABS = [
  { href: "/pengaturan/karyawan", label: "Karyawan", desc: "Kelola izin akses dan data staf", module: "hr" },
  { href: "/pengaturan/outlet", label: "Outlet", desc: "Cabang toko dan inventaris terpisah" },
  { href: "/pengaturan/bisnis", label: "Bisnis", desc: "Informasi pajak, poin, dan struk" },
  { href: "/pengaturan/kartu", label: "Kartu Member", desc: "Pengaturan loyalty poin member", module: "member" },
  { href: "/pengaturan/meja", label: "Nomor Meja", desc: "Atur kode QR pesanan meja", module: "pesanan-digital" },
  { href: "/pengaturan/laundry", label: "Laundry", desc: "Kategori layanan laundry", module: "laundry" },
  { href: "/pengaturan/modifier", label: "Modifier Menu", desc: "Level gula, tambahan espresso, dll per kategori", module: "kasir" },
  { href: "/pengaturan/promo", label: "Promo", desc: "Diskon otomatis dan voucher", module: "promo" },
  { href: "/pengaturan/langganan", label: "Langganan", desc: "Detail paket aktif Altora" },
  { href: "/pengaturan/audit-log", label: "Log Audit", desc: "Riwayat aktivitas staf penting" },
];

export default function PengaturanPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // mobile threshold
      setIsMobile(mobile);
      if (!mobile) {
        router.replace("/pengaturan/bisnis");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  if (isMobile === null) return null;
  if (isMobile === false) return null;

  return (
    <div className="flex flex-col gap-3 pb-8">
      <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center justify-between rounded-xl p-3.5 hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-[var(--color-text)]">{tab.label}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{tab.desc}</p>
            </div>
            <span className="text-[var(--color-text-muted)] text-sm">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
