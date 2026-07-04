"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signDocumentAction, rejectDocumentAction } from "@/app/(app)/dokumen/actions";
import { SignatureCapture } from "./signature-capture";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type DocumentViewerProps = {
  document: any;
  currentUserId: string;
  canSign: boolean;
  pendingSigner?: any;
};

export function DocumentViewer({
  document,
  currentUserId,
  canSign,
  pendingSigner,
}: DocumentViewerProps) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSign() {
    if (!signatureData) {
      setError("Tanda tangan wajib dibuat");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await signDocumentAction(document.id, signatureData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Dokumen ditandatangani");
      router.refresh();
      setShowSigningModal(false);
    });
  }

  function handleReject() {
    if (!rejectReason.trim()) {
      setError("Alasan penolakan wajib diisi");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await rejectDocumentAction(document.id, rejectReason);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Dokumen ditolak");
      router.refresh();
    });
  }

  const signedCount = document.signers.filter((s: any) => s.status === "SIGNED").length;
  const totalSigners = document.signers.length;
  const progress = totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{document.name}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Upload oleh {document.uploader.name}
          </p>
        </div>
      </div>

      {document.signers.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--color-text)]">Progress Tanda Tangan</h3>
            <span className="text-sm font-medium text-[var(--color-primary)]">{progress}%</span>
          </div>
          <div className="mb-4 h-2 w-full rounded-full bg-[var(--color-bg)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="space-y-2">
            {document.signers.map((signer: any, idx: number) => (
              <div key={signer.id} className="flex items-center gap-3 rounded-lg bg-[var(--color-bg)] p-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)]">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">
                    {signer.signer.name}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {signer.signer.email}
                  </p>
                </div>
                <div className="text-right">
                  {signer.status === "SIGNED" && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      ✓ Ditanda tangani
                    </span>
                  )}
                  {signer.status === "PENDING" && (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      ○ Menunggu
                    </span>
                  )}
                  {signer.status === "REJECTED" && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      ✗ Ditolak
                    </span>
                  )}
                  {signer.status === "SKIPPED" && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                      - Dilewati
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <iframe
          src={document.fileUrl}
          className="h-[600px] w-full rounded-lg border border-[var(--color-border)]"
          title={document.name}
        />
      </div>

      {canSign && pendingSigner && (
        <button
          onClick={() => setShowSigningModal(true)}
          className="min-h-[48px] rounded-lg bg-[var(--color-primary)] px-4 text-base font-semibold text-[var(--color-on-primary)]"
        >
          Tanda Tangani Dokumen
        </button>
      )}

      {showSigningModal && canSign && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
          <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Tanda Tangani Dokumen</h2>
              <button
                onClick={() => {
                  setShowSigningModal(false);
                  setError(null);
                }}
                aria-label="Tutup"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
              >
                <XIcon aria-hidden className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Tanda Tangan*
                </label>
                <SignatureCapture onSignatureChange={setSignatureData} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Atau Tolak Dokumen
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Alasan penolakan (opsional)"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              {rejectReason.trim() && (
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex min-h-[48px] flex-1 items-center justify-center rounded-lg border border-red-500 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Tolak
                </button>
              )}
              <button
                onClick={handleSign}
                disabled={isPending || !signatureData}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
              >
                {isPending ? "Menyimpan..." : "Tanda Tangani"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
