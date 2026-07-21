"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SettingsBackButton() {
  const pathname = usePathname();
  if (pathname === "/pengaturan") return null;

  return (
    <Link
      href="/pengaturan"
      className="flex h-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-xs font-bold text-[var(--color-text-secondary)] shadow-sm transition-colors hover:bg-[var(--color-bg-secondary)] lg:hidden"
    >
      ← Menu Pengaturan
    </Link>
  );
}
