"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import {
  uploadDocumentAction,
  deleteDocumentAction,
  initiateSigningAction,
} from "@/app/(app)/dokumen/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type DocumentRow = {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "PENDING_SIGNATURE" | "IN_PROGRESS" | "SIGNED" | "REJECTED" | "EXPIRED";
  uploadedBy: string;
  uploader: { name: string };
  fileUrl: string;
  createdAt: Date;
  signers: Array<{ userId: string; status: string }>;
};

function DocumentUploadModal({
  users,
  onClose,
  onSaved,
}: {
  users: User[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedSigners, setSelectedSigners] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleSigner(userId: string) {
    if (selectedSigners.includes(userId)) {
      setSelectedSigners(selectedSigners.filter((id) => id !== userId));
    } else {
      setSelectedSigners([...selectedSigners, userId]);
    }
  }

  function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama dokumen wajib diisi.");
    if (!file) return setError("File wajib dipilih.");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("signers", JSON.stringify(selectedSigners));

      const result = await uploadDocumentAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Dokumen berhasil diunggah");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Upload Dokumen</h2>
          <button
            onClick={onClose}
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama Dokumen*</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kontrak Supplier"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan deskripsi dokumen..."
              rows={3}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">File Dokumen*</label>
            <label className="flex min-h-[120px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] transition hover:border-[var(--color-primary)]">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {file ? file.name : "Pilih atau drag file ke sini"}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">PDF, Word, Excel</p>
              </div>
            </label>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Penandatangan (Opsional)</h3>
            <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--color-bg)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedSigners.includes(user.id)}
                    onChange={() => toggleSigner(user.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">{user.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
        >
          {isPending ? "Mengunggah..." : "Upload Dokumen"}
        </button>
      </div>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_SIGNATURE: "Menunggu Tanda Tangan",
  IN_PROGRESS: "Sedang Ditandatangani",
  SIGNED: "Sudah Ditandatangani",
  REJECTED: "Ditolak",
  EXPIRED: "Expired",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-[var(--color-bg)] text-[var(--color-text)]",
  PENDING_SIGNATURE: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  SIGNED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

export function DocumentManager({
  documents,
  users,
}: {
  documents: DocumentRow[];
  users: User[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function deleteDocument(docId: string) {
    if (!confirm("Hapus dokumen ini?")) return;

    startTransition(async () => {
      const result = await deleteDocumentAction(docId);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Dokumen dihapus");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Dokumen</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Manajemen dokumen & E-Signature</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="min-h-[44px] w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] sm:w-auto"
        >
          + Upload Dokumen
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {documents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada dokumen. Upload dokumen pertamamu →
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {documents.map((doc) => {
              const signedCount = doc.signers.filter((s) => s.status === "SIGNED").length;
              return (
                <div key={doc.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {doc.name}
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[doc.status]}`}>
                        {statusLabels[doc.status]}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Upload oleh {doc.uploader.name}
                    </p>
                    {doc.signers.length > 0 && (
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        Ditandatangani: {signedCount}/{doc.signers.length}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/dokumen/${doc.id}`}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 sm:flex-none"
                    >
                      Lihat
                    </a>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      disabled={isPending}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <DocumentUploadModal
          users={users}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
