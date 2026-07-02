"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/pengaturan/karyawan", label: "Karyawan" },
  { href: "/pengaturan/outlet", label: "Outlet" },
  { href: "/pengaturan/bisnis", label: "Bisnis" },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto border-b border-[var(--color-border)] pb-px">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`min-h-[44px] shrink-0 border-b-2 px-3 flex items-center text-sm font-medium ${
              active
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
