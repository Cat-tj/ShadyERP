"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/pengaturan/karyawan", label: "Karyawan", module: "hr" },
  { href: "/pengaturan/outlet", label: "Outlet" },
  { href: "/pengaturan/bisnis", label: "Bisnis" },
  { href: "/pengaturan/modul", label: "Modul" },
  { href: "/pengaturan/kartu", label: "Kartu", module: "member" },
  { href: "/pengaturan/meja", label: "Meja", module: "pesanan-digital" },
  { href: "/pengaturan/laundry", label: "Laundry", module: "laundry" },
  { href: "/pengaturan/promo", label: "Promo", module: "promo" },
  { href: "/pengaturan/langganan", label: "Langganan" },
  { href: "/pengaturan/audit-log", label: "Log audit" },
];

export function SettingsTabs({ disabledModules = [] }: { disabledModules?: string[] }) {
  const pathname = usePathname();
  const disabledSet = new Set(disabledModules);

  return (
    <div className="hairline-gold mb-4 flex gap-2 overflow-x-auto border-b pb-px">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const isDisabled = tab.module && disabledSet.has(tab.module);

        if (isDisabled) {
          return (
            <span
              key={tab.href}
              title={`Modul ${tab.label} dinonaktifkan`}
              className="min-h-[44px] shrink-0 border-b-2 border-transparent px-3 flex items-center text-sm font-medium text-[var(--color-text-secondary)]/40 cursor-not-allowed select-none"
            >
              {tab.label}
            </span>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`min-h-[44px] shrink-0 border-b-2 px-3 flex items-center text-sm font-medium transition-colors ${
              active
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
