"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { navItemsForHub, type Role } from "@/lib/nav";
import { UserIcon, PowerIcon, GridIcon } from "@/components/ui/icons";
import { resolveEnabledModules, getModuleForPath, MODULE_MAP } from "@/lib/modules";
import { HUBS, HUB_MAP, getHubForPath, type HubKey } from "@/lib/hubs";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

const ACTIVE_HUB_STORAGE_KEY = "altora:activeHub";
const ACTIVE_HUB_CHANGED_EVENT = "altora:activeHubChanged";

function getStoredHubKeySnapshot(): HubKey | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(ACTIVE_HUB_STORAGE_KEY) as HubKey | null;
  return saved && HUB_MAP[saved] ? saved : null;
}

function subscribeToStoredHubKey(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ACTIVE_HUB_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ACTIVE_HUB_CHANGED_EVENT, onStoreChange);
  };
}

export function AppShell({
  userName,
  role,
  tenantName,
  disabledModules,
  children,
}: {
  userName: string;
  role: Role;
  tenantName: string;
  disabledModules: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCommandCenter = pathname === "/command-center";
  const enabledModules = resolveEnabledModules(disabledModules);

  const pathHub = getHubForPath(pathname);
  const storedHubKey = useSyncExternalStore(subscribeToStoredHubKey, getStoredHubKeySnapshot, () => null);

  useEffect(() => {
    if (pathHub) {
      localStorage.setItem(ACTIVE_HUB_STORAGE_KEY, pathHub.key);
      window.dispatchEvent(new Event(ACTIVE_HUB_CHANGED_EVENT));
    }
  }, [pathHub]);

  const activeHub = pathHub ?? (storedHubKey ? HUB_MAP[storedHubKey] : null) ?? HUBS[0];

  const items = navItemsForHub(role, activeHub.key, enabledModules);
  const bottomItems = items.filter((item) => item.showOnBottomNav).slice(0, 5);
  // Beberapa href saling jadi prefix (mis. /kpi & /kpi/analitik) — hanya item
  // dengan prefix TERPANJANG yang cocok yang boleh nyala, biar tidak dobel.
  const activeHref = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  // Halaman fitur (mis. /absensi, /laporan) ikut warna modulnya sendiri; halaman
  // netral (Pengaturan, Akun) tetap pakai warna brand default dari globals.css.
  const currentModule = getModuleForPath(pathname);
  const contentThemeStyle = currentModule
    ? ({
        "--color-primary": currentModule.color,
        "--color-primary-dark": currentModule.colorDark,
      } as React.CSSProperties)
    : undefined;
  const shellBackgroundStyle: React.CSSProperties | undefined = currentModule
    ? {
        backgroundImage: `radial-gradient(1100px 640px at 12% -8%, ${currentModule.colorSoft} 0%, transparent 60%), radial-gradient(900px 560px at 100% 0%, ${currentModule.colorSoft} 0%, transparent 55%)`,
      }
    : undefined;

  return (
    <div className="flex min-h-dvh w-full" style={shellBackgroundStyle}>
      {/* Sidebar desktop */}
      {!isCommandCenter && (
        <aside className="glass-surface sticky top-0 hidden h-dvh w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0 lg:flex">
          <div className="flex h-16 items-center gap-3 border-b border-[var(--color-gold-soft)] px-5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-sm font-semibold text-white"
              style={{ backgroundColor: activeHub.color }}
            >
              {tenantName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-[var(--color-text)]">{tenantName}</p>
              <p className="truncate text-xs font-medium" style={{ color: activeHub.color }}>
                {activeHub.label}
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {items.map((item) => {
              const active = item.href === activeHref;
              const Icon = item.icon;
              const itemModule = item.module ? MODULE_MAP[item.module] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={
                    active && itemModule
                      ? { backgroundColor: itemModule.color, color: "#fff" }
                      : active
                        ? { backgroundColor: activeHub.color, color: "#fff" }
                        : undefined
                  }
                  className={`flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                    active ? "" : "text-[var(--color-text)] hover:bg-white/40"
                  }`}
                >
                  <Icon
                    aria-hidden
                    className="h-5 w-5 shrink-0"
                    style={!active ? { color: itemModule?.color ?? activeHub.color } : undefined}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[var(--color-gold-soft)] p-3">
            <Link
              href="/pilih-aplikasi"
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--color-text)] hover:bg-white/40"
            >
              <GridIcon aria-hidden className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
              Ganti Aplikasi
            </Link>
          </div>
          <div className="border-t border-[var(--color-gold-soft)] p-4">
            <Link href="/akun" className="block hover:opacity-80">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">{userName}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{ROLE_LABEL[role]}</p>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-3 min-h-[40px] w-full rounded-lg border border-[var(--color-border)] bg-white/40 text-sm font-medium text-[var(--color-text)] transition-colors duration-150 hover:bg-white/70"
            >
              Keluar
            </button>
          </div>
        </aside>
      )}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Topbar mobile & tablet */}
        {!isCommandCenter && (
          <header className="glass-nav sticky top-0 z-10 flex h-14 items-center justify-between rounded-none border-x-0 border-t-0 px-4 lg:hidden">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg font-display text-xs font-semibold text-white"
                style={{ backgroundColor: activeHub.color }}
              >
                {tenantName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-[var(--color-text)]">{tenantName}</p>
                <p className="truncate text-[10px] font-medium leading-none" style={{ color: activeHub.color }}>
                  {activeHub.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/pilih-aplikasi"
                aria-label="Ganti aplikasi"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-white/40"
              >
                <GridIcon aria-hidden className="h-5 w-5" />
              </Link>
              <Link
                href="/akun"
                aria-label="Akun saya"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-white/40"
              >
                <UserIcon aria-hidden className="h-5 w-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Keluar"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-white/40"
              >
                <PowerIcon aria-hidden className="h-5 w-5" />
              </button>
            </div>
          </header>
        )}

        <main
          className={`flex-1 overflow-y-auto ${
            isCommandCenter
              ? "p-4 lg:p-6"
              : "px-4 py-5 pb-24 sm:px-5 lg:px-8 lg:py-8 lg:pb-8"
          }`}
          style={contentThemeStyle}
        >
          {children}
        </main>

        {/* Bottom nav mobile */}
        {!isCommandCenter && (
          <nav className="glass-nav fixed inset-x-0 bottom-0 z-10 flex rounded-none border-x-0 border-b-0 lg:hidden">
            {bottomItems.map((item) => {
              const active = item.href === activeHref;
              const Icon = item.icon;
              const itemModule = item.module ? MODULE_MAP[item.module] : null;
              const activeColor = itemModule?.color ?? activeHub.color;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ color: active ? activeColor : undefined }}
                  className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-150 ${
                    active ? "" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Icon aria-hidden className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
