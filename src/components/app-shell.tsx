"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { navItemsForRole, type Role } from "@/lib/nav";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

export function AppShell({
  userName,
  role,
  tenantName,
  children,
}: {
  userName: string;
  role: Role;
  tenantName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = navItemsForRole(role);
  const bottomItems = items.filter((item) => item.showOnBottomNav).slice(0, 5);

  return (
    <div className="flex min-h-screen w-full">
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
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "text-[var(--color-text)] hover:bg-white/40"
                }`}
              >
                <span className="text-base" aria-hidden>
                  {item.icon}
                </span>
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
        <header className="glass-surface sticky top-0 z-10 flex h-14 items-center justify-between rounded-none border-x-0 border-t-0 px-4 md:hidden">
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
              👤
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Keluar"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-white/40"
            >
              ⏻
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>

        {/* Bottom nav mobile */}
        <nav className="glass-surface fixed inset-x-0 bottom-0 z-10 flex rounded-none border-x-0 border-b-0 md:hidden">
          {bottomItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-150 ${
                  active ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
