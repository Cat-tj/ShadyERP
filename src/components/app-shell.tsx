"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { navItemsForHub, type Role, hubsAvailableForRole } from "@/lib/nav";
import { UserIcon, PowerIcon, GridIcon, ChevronDownIcon } from "@/components/ui/icons";
import MobileCartBar from "@/components/ui/mobile-cart-bar";
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
  accountingMode = "SIMPLE",
  children,
}: {
  userName: string;
  role: Role;
  tenantName: string;
  disabledModules: string[];
  accountingMode?: "SIMPLE" | "ADVANCED";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCommandCenter = pathname === "/command-center";
  const enabledModules = resolveEnabledModules(disabledModules);

  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showMobileSwitcher, setShowMobileSwitcher] = useState(false);

  const pathHub = getHubForPath(pathname);
  const storedHubKey = useSyncExternalStore(subscribeToStoredHubKey, getStoredHubKeySnapshot, () => null);

  useEffect(() => {
    if (pathHub) {
      localStorage.setItem(ACTIVE_HUB_STORAGE_KEY, pathHub.key);
      window.dispatchEvent(new Event(ACTIVE_HUB_CHANGED_EVENT));
    }
  }, [pathHub]);

  const activeHub = pathHub ?? (storedHubKey ? HUB_MAP[storedHubKey] : null) ?? HUBS[0];

  const availableHubKeys = Array.from(hubsAvailableForRole(role, enabledModules));
  const otherHubs = HUBS.filter(
    (hub) => availableHubKeys.includes(hub.key) && hub.key !== activeHub.key
  );

  const rawItems = navItemsForHub(role, activeHub.key, enabledModules);
  const items = accountingMode === "SIMPLE"
    ? rawItems.filter((item) => item.href !== "/finance/jurnal")
    : rawItems;
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

  const shellBackgroundStyle: React.CSSProperties = {
    backgroundImage: `radial-gradient(1100px 640px at 12% -8%, rgba(167, 48, 168, 0.05) 0%, transparent 55%), radial-gradient(900px 560px at 100% 0%, rgba(37, 99, 235, 0.04) 0%, transparent 50%), linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%)`,
    backgroundAttachment: "fixed",
  };

  return (
    <div className="flex min-h-dvh w-full bg-[var(--color-bg)]" style={shellBackgroundStyle}>
      {/* Sidebar desktop */}
      {!isCommandCenter && (
        <aside className="glass-surface sticky top-0 hidden h-dvh w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0 lg:flex">
          <div className="relative border-b border-[var(--color-gold-soft)]">
            <button
              onClick={() => setShowSwitcher(!showSwitcher)}
              className="flex h-14 w-full items-center gap-3 px-5 text-left transition-colors hover:bg-white/40 cursor-pointer"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: activeHub.color }}
              >
                {tenantName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 pr-1">
                <p className="truncate font-display text-sm font-semibold text-[var(--color-text)]">{tenantName}</p>
                <p className="truncate text-xs font-medium" style={{ color: activeHub.color }}>
                  {activeHub.label}
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200" style={{ transform: showSwitcher ? "rotate(180deg)" : undefined }} />
            </button>
 
            {/* Popover Desktop Switcher */}
            {showSwitcher && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSwitcher(false)} />
                <div className="absolute left-4 right-4 top-12 z-50 flex flex-col gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl animate-[fadeInUp_0.15s_ease-out_forwards]">
                  <p className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[var(--color-text-secondary)] uppercase">
                    Pindah Aplikasi
                  </p>
                  <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-0.5">
                    {otherHubs.map((hub) => {
                      const HubIcon = hub.icon;
                      return (
                        <button
                          key={hub.key}
                          onClick={() => {
                            localStorage.setItem(ACTIVE_HUB_STORAGE_KEY, hub.key);
                            window.dispatchEvent(new Event(ACTIVE_HUB_CHANGED_EVENT));
                            setShowSwitcher(false);
                            window.location.href = hub.homeHref;
                          }}
                          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)] cursor-pointer"
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-black shadow-sm"
                            style={{ backgroundImage: `linear-gradient(135deg, ${hub.color} 0%, ${hub.colorDark} 100%)` }}
                          >
                            <HubIcon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {hub.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
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
                  className={`flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
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
          <div className="border-t border-[var(--color-gold-soft)] p-2">
            <Link
              href="/pilih-aplikasi"
              className="flex min-h-[38px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--color-text)] hover:bg-white/40"
            >
              <GridIcon aria-hidden className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
              Ganti Aplikasi
            </Link>
          </div>
          <div className="border-t border-[var(--color-gold-soft)] p-3">
            <Link href="/akun" className="block hover:opacity-80">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">{userName}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{ROLE_LABEL[role]}</p>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-2.5 min-h-[36px] w-full rounded-lg border border-[var(--color-border)] bg-white/40 text-xs font-semibold text-[var(--color-text)] transition-colors duration-150 hover:bg-white/70"
            >
              Keluar
            </button>
          </div>
        </aside>
      )}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Topbar mobile & tablet */}
        {!isCommandCenter && (
          <header className="glass-nav topbar-mobile sticky top-0 z-10 flex h-14 items-center justify-between rounded-none border-x-0 border-t-0 px-4 lg:hidden">
            <div className="relative flex items-center">
              <button
                onClick={() => setShowMobileSwitcher(!showMobileSwitcher)}
                className="flex items-center gap-2 text-left hover:opacity-80 cursor-pointer"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: activeHub.color }}
                >
                  {tenantName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 pr-1">
                  <p className="truncate font-display text-sm font-semibold text-[var(--color-text)] leading-tight">{tenantName}</p>
                  <p className="truncate text-[10px] font-medium leading-none" style={{ color: activeHub.color }}>
                    {activeHub.label}
                  </p>
                </div>
                <ChevronDownIcon className="h-3 w-3 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200" style={{ transform: showMobileSwitcher ? "rotate(180deg)" : undefined }} />
              </button>

              {/* Popover Mobile Switcher */}
              {showMobileSwitcher && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowMobileSwitcher(false)} />
                  <div className="absolute left-0 top-11 z-50 flex w-56 flex-col gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl animate-[fadeInUp_0.15s_ease-out_forwards]">
                    <p className="px-3 py-1.5 text-[9px] font-bold tracking-wider text-[var(--color-text-secondary)] uppercase">
                      Pindah Aplikasi
                    </p>
                    <div className="max-h-[50vh] overflow-y-auto flex flex-col gap-0.5">
                      {otherHubs.map((hub) => {
                        const HubIcon = hub.icon;
                        return (
                          <button
                            key={hub.key}
                            onClick={() => {
                              localStorage.setItem(ACTIVE_HUB_STORAGE_KEY, hub.key);
                              window.dispatchEvent(new Event(ACTIVE_HUB_CHANGED_EVENT));
                              setShowMobileSwitcher(false);
                              window.location.href = hub.homeHref;
                            }}
                            className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)] cursor-pointer"
                          >
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white font-black shadow-sm"
                              style={{ backgroundImage: `linear-gradient(135deg, ${hub.color} 0%, ${hub.colorDark} 100%)` }}
                            >
                              <HubIcon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-xs">
                              {hub.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
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
          className={`flex-1 overflow-y-auto bg-transparent ${
            isCommandCenter
              ? "p-4 lg:p-6"
              : "mx-auto w-full max-w-[var(--content-max-width)] px-[var(--content-padding-x)] py-[var(--content-padding-y)]"
          }`}
          style={{
            ...contentThemeStyle,
            // Ensure content never hides under bottom nav on mobile. If a mobile
            // cart bar is present, add its height as well so content never
            // becomes hidden under stacked fixed elements.
            paddingBottom: isCommandCenter ? undefined : "calc(var(--bottom-nav-height) + 24px + var(--mobile-cart-height))",
          }}
        >
          {children}
        </main>

        {/* Mobile cart bar */}
        <MobileCartBar />

        {/* Bottom nav mobile */}
        {!isCommandCenter && bottomItems.length > 0 && (
          <nav
            className="glass-nav fixed inset-x-0 bottom-0 z-20 flex rounded-none border-x-0 border-b-0 lg:hidden"
            style={{ height: "var(--bottom-nav-height)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
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
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors duration-150 ${
                    active ? "" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-150 ${
                      active ? "scale-110" : ""
                    }`}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="leading-none">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
