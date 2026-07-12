"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon } from "@/components/ui/icons";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
          <AlertTriangleIcon aria-hidden className="h-6 w-6" />
        </div>
        <h1 className="mt-3 text-lg font-bold text-[var(--color-text)]">Ada yang salah</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Terjadi kendala saat memuat halaman ini. Coba lagi, atau kembali ke beranda kalau masih
          gagal.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] hover:opacity-90"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="flex min-h-[48px] w-full items-center justify-center rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
