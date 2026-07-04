"use client";

import Link from "next/link";

export type SigningQueueItem = {
  id: string;
  documentId: string;
  document: {
    id: string;
    name: string;
    fileUrl: string;
    uploadedBy: string;
    uploader: { name: string };
  };
  sequence: number;
  status: string;
  signer: { name: string };
};

export function SigningQueue({ items }: { items: SigningQueueItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Tidak ada dokumen yang perlu ditandatangani
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                {item.document.name}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {item.document.uploader.name} menunggu tanda tanganmu
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-[var(--color-primary)] px-2 py-1 text-xs font-medium text-[var(--color-on-primary)]">
                  #{item.sequence}
                </span>
                {item.status === "PENDING" && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    Tindakan diperlukan
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/dokumen/${item.documentId}`}
              className="min-h-[44px] w-full rounded-lg border border-[var(--color-primary)] px-4 text-center text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 sm:w-auto"
            >
              Tanda Tangani
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
