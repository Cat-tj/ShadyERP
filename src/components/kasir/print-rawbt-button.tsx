"use client";

export function PrintRawBtButton({ rawBtUrl }: { rawBtUrl: string }) {
  return (
    <a
      href={rawBtUrl}
      className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-base font-semibold text-[var(--color-on-primary)]"
    >
      Cetak struk fisik (RawBT)
    </a>
  );
}
