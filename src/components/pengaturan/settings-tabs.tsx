"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/pengaturan/karyawan", label: "Karyawan", module: "hr" },
  { href: "/pengaturan/outlet", label: "Outlet" },
  { href: "/pengaturan/bisnis", label: "Bisnis" },
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
    <div className="hairline-gold mb-4 flex gap-2 overflow-x-auto border-b pb-1">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const isDisabled = tab.module && disabledSet.has(tab.module);

        if (isDisabled) return null;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={active ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)" } : undefined}
            className={`min-h-[38px] shrink-0 rounded-full border px-4 flex items-center text-sm font-medium transition-all duration-150 ${
              active
                ? "text-[var(--color-on-primary)] shadow-sm"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
