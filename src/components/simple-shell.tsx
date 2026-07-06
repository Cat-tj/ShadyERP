"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { HomeIcon, BarChartIcon, GridIcon, ReceiptIcon, WalletIcon, UserIcon, PowerIcon } from "@/components/ui/icons";
import type { Role } from "@/lib/nav";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

const tabs = [
  { href: "/simple/hari-ini", label: "Hari Ini", icon: HomeIcon },
  { href: "/kasir", label: "Kasir", icon: ReceiptIcon },
  { href: "/simple/uang", label: "Uang", icon: WalletIcon },
  { href: "/simple/data", label: "Data", icon: BarChartIcon },
  { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
];

export function SimpleShell({
  userName,
  role,
  tenantName,
  children,
  alertCount = 0,
}: {
  userName: string;
  role: Role;
  tenantName: string;
  children: React.ReactNode;
  alertCount?: number;
}) {
  const pathname = usePathname();
  const shellBackgroundStyle: React.CSSProperties = {
    backgroundImage:
      "radial-gradient(900px 520px at 0% -10%, rgba(167, 48, 168, 0.06) 0%, transparent 58%), radial-gradient(760px 480px at 100% 0%, rgba(22, 163, 74, 0.05) 0%, transparent 52%), linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%)",
    backgroundAttachment: "fixed",
  };

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-20" style={shellBackgroundStyle}>
      <header className="glass-nav sticky top-0 z-20 border-x-0 border-t-0 rounded-none">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/simple/hari-ini" className="min-w-0">
            <p className="font-display text-sm font-bold text-[var(--color-text)]">ALTORA</p>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">{tenantName}</p>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/akun"
              className="flex min-h-[38px] items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white/45 px-3 text-xs font-semibold text-[var(--color-text)]"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{userName}</span>
              <span className="sm:hidden">{ROLE_LABEL[role]}</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-white/45 text-[var(--color-text)]"
              aria-label="Keluar"
            >
              <PowerIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-h-[54px] flex-col items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                }`}
              >
                <span className="relative mb-1">
                  <Icon className="h-5 w-5" />
                  {tab.href === "/simple/data" && alertCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[var(--color-surface)]">
                      {alertCount}
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
