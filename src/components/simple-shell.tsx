"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { getCurrentLoginUrl } from "@/lib/auth-client";
import {
  BarChartIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  GridIcon,
  HomeIcon,
  PackageIcon,
  ReceiptIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  PowerIcon,
} from "@/components/ui/icons";
import type { Role } from "@/lib/nav";
import type { VerticalDef } from "@/lib/verticals";
import { SettingsSidebarNav } from "@/features/settings/components/settings-sidebar-nav";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

type SimpleTab = {
  href: string;
  label: string;
  icon: typeof ReceiptIcon;
};

// Halaman yang hanya bisa dibuka OWNER/MANAGER (lihat requireRole di
// masing-masing page). STAFF yang tap tab ini akan langsung ke-redirect ke
// /pilih-aplikasi tanpa penjelasan — jadi tab-tab ini disaring keluar dari
// bottom nav STAFF di bawah, bukan ditampilkan tapi tidak bisa dibuka.
const OWNER_MANAGER_ONLY_HREFS = ["/simple/data", "/simple/hari-ini", "/finance", "/finance/laba-rugi", "/inventory"];

function getSimpleTabs(vertical: VerticalDef | undefined, role: Role): SimpleTab[] {
  const allTabs: SimpleTab[] = (() => {
    switch (vertical?.key) {
      case "teams":
        return [
          { href: role === "STAFF" ? "/absensi" : "/hris", label: role === "STAFF" ? "Absen" : "Tim", icon: UsersIcon },
          { href: "/tim", label: "Jadwal", icon: CalendarIcon },
          { href: "/simple/data", label: "Data", icon: BarChartIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
      case "pabrik":
        return [
          { href: "/produksi", label: "Produksi", icon: BuildingIcon },
          { href: "/inventory", label: "Stok", icon: PackageIcon },
          { href: "/simple/data", label: "Data", icon: BarChartIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
      case "accounting":
        return [
          { href: "/finance", label: "Finance", icon: WalletIcon },
          { href: "/finance/laba-rugi", label: "Laporan", icon: BarChartIcon },
          { href: "/simple/data", label: "Data", icon: BarChartIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
      case "laundry":
        return [
          { href: "/laundry", label: "Laundry", icon: BriefcaseIcon },
          { href: "/simple/uang", label: "Uang", icon: WalletIcon },
          { href: "/simple/data", label: "Data", icon: BarChartIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
      case "jasa":
        return [
          { href: "/booking", label: "Booking", icon: CalendarIcon },
          { href: "/simple/uang", label: "Uang", icon: WalletIcon },
          { href: "/simple/data", label: "Data", icon: BarChartIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
      case "company":
        return [
          { href: "/simple/hari-ini", label: "Ringkasan", icon: HomeIcon },
          { href: "/finance", label: "Finance", icon: WalletIcon },
          { href: "/hris", label: "Tim", icon: UsersIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
      case "supermarket":
        return [
          { href: "/kpi", label: "Dashboard", icon: HomeIcon },
          { href: "/kasir", label: "Kasir", icon: ReceiptIcon },
          { href: "/inventory", label: "Stok", icon: PackageIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
      default:
        return [
          { href: "/kasir", label: "Kasir", icon: ReceiptIcon },
          { href: "/simple/uang", label: "Uang", icon: WalletIcon },
          { href: "/simple/data", label: "Data", icon: BarChartIcon },
          { href: "/simple/menu", label: "Lainnya", icon: GridIcon },
        ];
    }
  })();

  if (role !== "STAFF") return allTabs;

  const visibleTabs = allTabs.filter((tab) => !OWNER_MANAGER_ONLY_HREFS.includes(tab.href));

  // Absensi harus jadi tab utama buat STAFF, bukan ketimbun di dalam "Lainnya"
  // (feedback user langsung soal ini) — sisipkan sebelum "Lainnya" kalau belum ada.
  if (!visibleTabs.some((tab) => tab.href === "/absensi")) {
    const menuIndex = visibleTabs.findIndex((tab) => tab.href === "/simple/menu");
    const absenTab: SimpleTab = { href: "/absensi", label: "Absen", icon: UsersIcon };
    if (menuIndex === -1) {
      visibleTabs.push(absenTab);
    } else {
      visibleTabs.splice(menuIndex, 0, absenTab);
    }
  }

  return visibleTabs;
}

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
  "/tim",
  "/laundry",
  "/booking",
  "/finance",
  "/produksi",
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
  disabledModules = [],
  children,
  alertCount = 0,
  vertical,
}: {
  userName: string;
  role: Role;
  tenantName: string;
  disabledModules?: string[];
  children: React.ReactNode;
  alertCount?: number;
  vertical?: VerticalDef;
}) {
  const pathname = usePathname();
  // Kasir manages its own fixed-height, internally-scrolling layout (h-[calc(100dvh-Npx)])
  // that already budgets space for the bottom nav — the shell's own bottom padding on top
  // of that double-books the same space, leaving an empty draggable gap below the fold.
  const isFullBleedPage = pathname === "/kasir";
  const showAdvancedBanner = isAdvancedEscapePage(pathname);
  const tabs = getSimpleTabs(vertical, role);
  const homeHref = tabs[0]?.href ?? "/simple/hari-ini";
  const logoSrc = vertical ? `/brand/${vertical.key}-symbol-onlight.svg` : "/brand/altora-purple-symbol.svg";
  const modeLabel = vertical?.label ?? "Mode Simpel";
  const shellBackgroundStyle: React.CSSProperties = {
    backgroundImage:
      "radial-gradient(900px 520px at 0% -10%, rgba(167, 48, 168, 0.06) 0%, transparent 58%), radial-gradient(760px 480px at 100% 0%, rgba(22, 163, 74, 0.05) 0%, transparent 52%), linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%)",
    backgroundAttachment: "fixed",
  };
  // SimpleShell tidak punya theming per-modul seperti AppShell, jadi cukup satu
  // override di root — sengaja digate ketat ke vertical supermarket (sama seperti
  // AppShell) biar cafe/toko/dll yang juga punya theme di verticals.ts tidak
  // ikut berubah tanpa diminta.
  const verticalThemeStyle: React.CSSProperties | undefined =
    vertical?.key === "supermarket"
      ? ({
          "--color-primary": vertical.theme.primary,
          "--color-primary-dark": vertical.theme.deep,
        } as React.CSSProperties)
      : undefined;

  return (
    <div className="flex min-h-dvh w-full bg-[var(--color-bg)]" style={{ ...shellBackgroundStyle, ...verticalThemeStyle }}>
      <aside className="glass-surface sticky top-0 hidden h-dvh w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0 lg:flex">
        <Link href={homeHref} className="flex min-h-14 items-center gap-3 border-b border-[var(--color-gold-soft)] px-5">
          <img src={logoSrc} alt={modeLabel} className="h-8 w-8 shrink-0" />
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold text-[var(--color-text)]">{tenantName}</span>
            <span className="block text-xs font-medium text-[var(--color-primary)]">{modeLabel}</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Navigasi utama">
          <Link
            href="/simple/hari-ini"
            className={`flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === "/simple/hari-ini"
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "text-[var(--color-text)] hover:bg-white/40"
            }`}
          >
            <HomeIcon aria-hidden className="h-5 w-5 shrink-0" />
            Ringkasan
          </Link>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "text-[var(--color-text)] hover:bg-white/40"
                }`}
              >
                <Icon aria-hidden className="h-5 w-5 shrink-0" />
                <span className="flex-1">{tab.label}</span>
                {tab.href === "/simple/data" && alertCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </Link>
            );
          })}
          {role === "OWNER" && (
            <SettingsSidebarNav
              disabledModules={disabledModules}
              accentColor="var(--color-primary)"
              activeBackground="color-mix(in srgb, var(--color-primary) 10%, transparent)"
            />
          )}
        </nav>

        <div className="border-t border-[var(--color-gold-soft)] p-3">
          <Link href="/akun" className="block hover:opacity-80">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{userName}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{ROLE_LABEL[role]}</p>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: getCurrentLoginUrl() })}
            className="mt-2.5 min-h-[36px] w-full rounded-lg border border-[var(--color-border)] bg-white/40 text-xs font-semibold text-[var(--color-text)] transition-colors duration-150 hover:bg-white/70"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className={`min-w-0 flex-1 pb-[var(--content-padding-bottom)] lg:pb-0`}>
      <header className="glass-nav sticky top-0 z-20 rounded-none border-x-0 border-t-0 pt-[var(--safe-area-top)] lg:hidden">
        <div className="mx-auto flex h-[var(--topbar-height)] max-w-[1600px] items-center justify-between gap-4 px-[var(--content-padding-x)]">
          <div className="flex min-w-0 items-center gap-8">
            <Link href={homeHref} className="flex min-w-0 shrink-0 items-center gap-2">
              <img src={logoSrc} alt={modeLabel} className="h-8 w-8 shrink-0" />
              <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">{tenantName}</p>
            </Link>
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
              onClick={() => signOut({ callbackUrl: getCurrentLoginUrl() })}
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

      {/* Bottom tab bar — tablet & mobile only. Desktop (lg+) uses the sidebar. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 pb-[max(var(--safe-area-bottom),0.5rem)] pt-2 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
        style={{ height: "calc(var(--bottom-nav-height) + var(--safe-area-bottom))" }}
      >
        <div className="mx-auto grid max-w-5xl gap-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
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
    </div>
  );
}
