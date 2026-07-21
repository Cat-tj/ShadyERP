"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsIcon } from "@/components/ui/icons";
import { getVisibleSettingsNavigation } from "@/features/settings/settings-navigation";

export function SettingsSidebarNav({
  disabledModules,
  accentColor,
}: {
  disabledModules: string[];
  accentColor: string;
}) {
  const pathname = usePathname();
  const isSettingsArea = pathname === "/pengaturan" || pathname.startsWith("/pengaturan/");
  const items = getVisibleSettingsNavigation(disabledModules);

  return (
    <div className="py-0.5">
      <Link
        href="/pengaturan/bisnis"
        style={isSettingsArea ? { backgroundColor: accentColor, color: "#fff" } : undefined}
        className={`flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
          isSettingsArea ? "" : "text-[var(--color-text)] hover:bg-white/40"
        }`}
      >
        <SettingsIcon aria-hidden className="h-5 w-5 shrink-0" style={isSettingsArea ? undefined : { color: accentColor }} />
        Pengaturan
      </Link>

      {isSettingsArea && (
        <div className="ml-5 mt-1 space-y-0.5 border-l border-[var(--color-border)] py-1 pl-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={active ? { color: accentColor, backgroundColor: `${accentColor}14` } : undefined}
                className={`flex min-h-[36px] items-center rounded-md px-2.5 text-xs font-semibold transition-colors duration-150 ${
                  active
                    ? ""
                    : "text-[var(--color-text-secondary)] hover:bg-white/45 hover:text-[var(--color-text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
