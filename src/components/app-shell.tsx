"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { navItemsForRole, type Role } from "@/lib/nav";
import { UserIcon, PowerIcon } from "@/components/ui/icons";
import { resolveEnabledModules, getModuleForPath, MODULE_MAP } from "@/lib/modules";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

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
  const enabledModules = resolveEnabledModules(disabledModules);
  const items = navItemsForRole(role, enabledModules);
  const bottomItems = items.filter((item) => item.showOnBottomNav).slice(0, 5);
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
    <div className="flex min-h-screen w-full" style={shellBackgroundStyle}>
      {/* Sidebar desktop */}
      <aside className="glass-surface sticky top-0 hidden h-screen w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0 md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-[var(--color-gold-soft)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] font-display text-sm font-semibold text-[var(--color-on-primary)]">
            {tenantName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-[var(--color-text)]">{tenantName}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            const itemModule = item.module ? MODULE_MAP[item.module] : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  active && itemModule
                    ? { backgroundColor: itemModule.color, color: "#fff" }
                    : undefined
                }
                className={`flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? itemModule
                      ? ""
                      : "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "text-[var(--color-text)] hover:bg-white/40"
                }`}
              >
                <Icon
                  aria-hidden
                  className="h-5 w-5 shrink-0"
                  style={!active && itemModule ? { color: itemModule.color } : undefined}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
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

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar mobile & tablet */}
        <header className="glass-nav sticky top-0 z-10 flex h-14 items-center justify-between rounded-none border-x-0 border-t-0 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] font-display text-xs font-semibold text-[var(--color-on-primary)]">
              {tenantName.slice(0, 1).toUpperCase()}
            </div>
            <p className="truncate font-display text-sm font-semibold text-[var(--color-text)]">{tenantName}</p>
          </div>
          <div className="flex items-center gap-1">
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

        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8" style={contentThemeStyle}>
          {children}
        </main>

        {/* Bottom nav mobile */}
        <nav className="glass-nav fixed inset-x-0 bottom-0 z-10 flex rounded-none border-x-0 border-b-0 md:hidden">
          {bottomItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            const itemModule = item.module ? MODULE_MAP[item.module] : null;
            const activeColor = itemModule?.color ?? "var(--color-primary)";
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
      </div>
    </div>
  );
}
