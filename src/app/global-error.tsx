"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] p-6">
        <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <h1 className="text-lg font-bold text-[var(--color-text)]">Aplikasi gagal dimuat</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Terjadi kendala yang gak terduga. Coba muat ulang halaman ini.
          </p>
          <button
            onClick={() => reset()}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] hover:opacity-90"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
