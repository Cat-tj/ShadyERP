"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChartIcon, GridIcon, ReceiptIcon, WalletIcon, UserIcon, PowerIcon } from "@/components/ui/icons";
import type { Role } from "@/lib/nav";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

const tabs = [
  { href: "/kasir", label: "Kasir", icon: ReceiptIcon },
  { href: "/simple/uang", label: "Uang", icon: WalletIcon },
  { href: "/simple/data", label: "Data", icon: BarChartIcon },
  { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
];

// Halaman yang sengaja ditautkan dari hub "Lainnya" (simple/menu) — tetap bagian
// dari alur normal mode Simpel, jadi TIDAK perlu banner "mode lengkap".
const SIMPLE_FRIENDLY_PREFIXES = [
  "/akun",
  "/alerts",
  "/onboarding",
  "/produk",
  "/inventory",
  "/member",
  "/absensi",
  "/laundry",
  "/finance",
  "/pengaturan",
];

/** true kalau halaman ini cuma bisa dijangkau lewat link "Detail" dsb, bukan dari nav/hub Simpel biasa. */
function isAdvancedEscapePage(pathname: string) {
  if (pathname === "/kasir" || pathname.startsWith("/simple/")) return false;
  return !SIMPLE_FRIENDLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

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
  // Kasir manages its own fixed-height, internally-scrolling layout (h-[calc(100dvh-Npx)])
  // that already budgets space for the bottom nav — the shell's own bottom padding on top
  // of that double-books the same space, leaving an empty draggable gap below the fold.
  const isFullBleedPage = pathname === "/kasir";
  const showAdvancedBanner = isAdvancedEscapePage(pathname);
  const shellBackgroundStyle: React.CSSProperties = {
    backgroundImage:
      "radial-gradient(900px 520px at 0% -10%, rgba(167, 48, 168, 0.06) 0%, transparent 58%), radial-gradient(760px 480px at 100% 0%, rgba(22, 163, 74, 0.05) 0%, transparent 52%), linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%)",
    backgroundAttachment: "fixed",
  };

  return (
    <div
      className={`min-h-dvh bg-[var(--color-bg)] pb-[var(--content-padding-bottom)] lg:pb-0`}
      style={shellBackgroundStyle}
    >
      <header className="glass-nav sticky top-0 z-20 border-x-0 border-t-0 rounded-none pt-[var(--safe-area-top)]">
        <div className="mx-auto flex h-[var(--topbar-height)] max-w-[1600px] items-center justify-between gap-4 px-[var(--content-padding-x)]">
          <div className="flex min-w-0 items-center gap-8">
            <Link href="/simple/hari-ini" className="flex min-w-0 shrink-0 items-center gap-2">
              <img src="/brand/altora-symbol.svg" alt="Altora" className="h-8 w-8 shrink-0" />
              <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">{tenantName}</p>
            </Link>
            {/* Top nav — desktop only. Bottom tab bar (below) handles tablet/mobile. */}
            <nav className="hidden min-w-0 items-center gap-1 lg:flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.href === "/simple/data" && alertCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/akun"
              className="flex min-h-[40px] items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white/45 px-3.5 text-sm font-semibold text-[var(--color-text)]"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{userName}</span>
              <span className="sm:hidden">{ROLE_LABEL[role]}</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-white/45 text-[var(--color-text)]"
              aria-label="Keluar"
            >
              <PowerIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-[1600px] px-[var(--content-padding-x)] py-[var(--content-padding-y)] ${
          isFullBleedPage ? "md:py-0" : ""
        }`}
      >
        {showAdvancedBanner && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-primary)]/5 px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-secondary)]">Ini bagian mode lengkap — datanya lebih detail dari biasanya.</span>
            <Link href="/simple/hari-ini" className="shrink-0 font-semibold text-[var(--color-primary)] hover:underline">
              ← Balik ke ringkasan
            </Link>
          </div>
        )}
        {children}
      </main>

      {/* Bottom tab bar — tablet & mobile only. Desktop (lg+) uses the top nav above. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 pb-[max(var(--safe-area-bottom),0.5rem)] pt-2 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
        style={{ height: "calc(var(--bottom-nav-height) + var(--safe-area-bottom))" }}
      >
        <div className="mx-auto grid max-w-5xl grid-cols-4 gap-1">
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
