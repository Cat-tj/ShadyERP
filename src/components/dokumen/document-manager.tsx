"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  uploadDocumentAction,
  deleteDocumentAction,
} from "@/app/(app)/dokumen/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon, FileIcon, FolderIcon } from "@/components/ui/icons";
import { formatRelativeTime } from "@/lib/format";

export type DocumentStatus = "DRAFT" | "PENDING_SIGNATURE" | "IN_PROGRESS" | "SIGNED" | "REJECTED" | "EXPIRED";

export type DocumentRow = {
  id: string;
  name: string;
  description?: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploader: { name: string };
  fileUrl: string;
  createdAt: Date;
  signers: Array<{ userId: string; status: string }>;
};

/** Minimal signer DTO. Never pass authentication or credential fields to client components. */
type DocumentSigner = {
  id: string;
  name: string;
  email: string;
};

const statusLabels: Record<DocumentStatus, string> = {
  DRAFT: "Draft",
  PENDING_SIGNATURE: "Menunggu Tanda Tangan",
  IN_PROGRESS: "Sedang Ditandatangani",
  SIGNED: "Sudah Ditandatangani",
  REJECTED: "Ditolak",
  EXPIRED: "Expired",
};

const statusColors: Record<DocumentStatus, string> = {
  DRAFT: "bg-[var(--color-bg)] text-[var(--color-text)]",
  PENDING_SIGNATURE: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  SIGNED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

/** Badge warna per tipe file, ditebak dari ekstensi — biar file gampang dibedakan sekilas di grid. */
function getFileTypeMeta(fileUrl: string): { label: string; bg: string; fg: string } {
  const ext = fileUrl.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return { label: "PDF", bg: "#fee2d5", fg: "#c2410c" };
  if (["doc", "docx"].includes(ext)) return { label: "DOC", bg: "#dbeafe", fg: "#1d4ed8" };
  if (["xls", "xlsx", "csv"].includes(ext)) return { label: "XLS", bg: "#dcfce7", fg: "#15803d" };
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return { label: "IMG", bg: "#ede9fe", fg: "#6d28d9" };
  return { label: "FILE", bg: "#e2e6ec", fg: "#5b6478" };
}

const FILTERS: { key: "ALL" | DocumentStatus; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "DRAFT", label: "Draft" },
  { key: "PENDING_SIGNATURE", label: "Menunggu TTD" },
  { key: "SIGNED", label: "Selesai" },
  { key: "REJECTED", label: "Ditolak" },
];

function DocumentUploadModal({
  users,
  onClose,
  onSaved,
}: {
  users: DocumentSigner[];
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
    if (file.size > 8 * 1024 * 1024) return setError("Ukuran file maksimal 8MB.");

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

export function DocumentManager({
  documents,
  users,
  currentUserName,
}: {
  documents: DocumentRow[];
  users: DocumentSigner[];
  currentUserName: string;
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | DocumentStatus>("ALL");
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<DocumentStatus, number> = {
      DRAFT: 0,
      PENDING_SIGNATURE: 0,
      IN_PROGRESS: 0,
      SIGNED: 0,
      REJECTED: 0,
      EXPIRED: 0,
    };
    for (const doc of documents) c[doc.status]++;
    return c;
  }, [documents]);

  const filteredDocs = useMemo(
    () => (filter === "ALL" ? documents : documents.filter((d) => d.status === filter)),
    [documents, filter]
  );

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

  const folderCards: { key: DocumentStatus; label: string; color: string }[] = [
    { key: "DRAFT", label: "Draft", color: "#5b6478" },
    { key: "PENDING_SIGNATURE", label: "Menunggu TTD", color: "#b45309" },
    { key: "SIGNED", label: "Selesai", color: "#15803d" },
    { key: "REJECTED", label: "Ditolak", color: "#b91c1c" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Halo, {currentUserName.split(" ")[0]}</p>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Dokumen & Tanda Tangan Digital
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {documents.length} dokumen total — kelola, unggah, dan tandatangani di sini.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="min-h-[48px] shrink-0 rounded-lg bg-white px-5 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition hover:opacity-90"
          >
            + Upload Dokumen
          </button>
        </div>
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10"
          aria-hidden
        />
      </div>

      {/* Folder status cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {folderCards.map((card) => (
          <button
            key={card.key}
            onClick={() => setFilter(filter === card.key ? "ALL" : card.key)}
            className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition ${
              filter === card.key
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)]"
            }`}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${card.color}1a`, color: card.color }}
            >
              <FolderIcon aria-hidden className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono-data text-xl font-semibold tabular-nums text-[var(--color-text)]">
                {counts[card.key]}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filter pills + grid */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">Semua Dokumen</h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`min-h-[36px] rounded-full border px-4 text-xs font-medium transition ${
                  filter === f.key
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {documents.length === 0 ? "Belum ada dokumen. Upload dokumen pertamamu →" : "Tidak ada dokumen di kategori ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => {
              const fileMeta = getFileTypeMeta(doc.fileUrl);
              const signedCount = doc.signers.filter((s) => s.status === "SIGNED").length;
              return (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ backgroundColor: fileMeta.bg, color: fileMeta.fg }}
                    >
                      <FileIcon aria-hidden className="h-5 w-5" />
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[doc.status]}`}>
                      {statusLabels[doc.status]}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">{doc.name}</p>
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {fileMeta.label} · Upload oleh {doc.uploader.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {formatRelativeTime(doc.createdAt)}
                      {doc.signers.length > 0 && ` · TTD ${signedCount}/${doc.signers.length}`}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href={`/dokumen/${doc.id}`}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-center text-xs font-medium leading-[36px] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                    >
                      Lihat
                    </a>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      disabled={isPending}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
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
