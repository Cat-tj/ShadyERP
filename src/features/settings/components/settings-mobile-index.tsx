import Link from "next/link";
import type { SettingsNavigationItem } from "@/features/settings/settings-navigation";

export function SettingsMobileIndex({ items }: { items: SettingsNavigationItem[] }) {
  return (
    <>
      <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-sm lg:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[64px] items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-bg-secondary)]"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[var(--color-text)]">{item.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-[var(--color-text-secondary)]">{item.description}</span>
            </span>
            <span aria-hidden className="shrink-0 text-lg text-[var(--color-text-muted)]">›</span>
          </Link>
        ))}
      </div>

      <div className="hidden rounded-xl border border-dashed border-[var(--color-border)] bg-white/35 p-6 text-sm text-[var(--color-text-secondary)] lg:block">
        Pilih bagian pengaturan dari sidebar untuk mulai mengelola bisnis.
      </div>
    </>
  );
}
