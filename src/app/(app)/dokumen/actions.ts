"use server";

import { auth } from "@/lib/auth";
import { createDocument, getDocumentById, updateDocumentStatus } from "@/server/services/document-service";
import { signDocument, rejectDocument, initiateSigning } from "@/server/services/e-sign-service";

export async function uploadDocumentAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const signersJson = formData.get("signers") as string;
    const signers = JSON.parse(signersJson || "[]") as string[];

    if (!file || !name) {
      return { error: "File dan nama dokumen wajib" };
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB — di bawah batas body Server Action (10mb)
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Ukuran file maksimal 8MB" };
    }

    // Disimpan sebagai data URL langsung di kolom fileUrl (TEXT), pola yang
    // sama dipakai untuk foto absensi — tidak butuh setup object storage
    // terpisah. Cukup untuk dokumen berukuran wajar (kontrak, invoice, dll).
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    const fileUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const doc = await createDocument(
      session.user.tenantId,
      session.user.id,
      name,
      fileUrl,
      description
    );

    // If signers selected, initiate signing workflow
    if (signers.length > 0) {
      await initiateSigning(session.user.tenantId, doc.id, signers);
    }

    return { data: doc };
  } catch (err) {
    console.error("Error uploading document:", err);
    return { error: "Gagal mengunggah dokumen" };
  }
}

export async function deleteDocumentAction(documentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const doc = await getDocumentById(session.user.tenantId, documentId);
    if (!doc) {
      return { error: "Dokumen tidak ditemukan" };
    }

    // Only uploader can delete
    if (doc.uploadedBy !== session.user.id) {
      return { error: "Hanya pembuat dokumen yang bisa menghapus" };
    }

    await updateDocumentStatus(session.user.tenantId, documentId, "EXPIRED");

    return { data: null };
  } catch (err) {
    console.error("Error deleting document:", err);
    return { error: "Gagal menghapus dokumen" };
  }
}

export async function signDocumentAction(documentId: string, signatureData: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const result = await signDocument(
      session.user.tenantId,
      documentId,
      session.user.id,
      signatureData
    );

    return { data: result };
  } catch (err) {
    console.error("Error signing document:", err);
    return { error: "Gagal menandatangani dokumen" };
  }
}

export async function rejectDocumentAction(documentId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session.user.id) {
      return { error: "Unauthorized" };
    }

    const result = await rejectDocument(
      session.user.tenantId,
      documentId,
      session.user.id,
      reason
    );

    return { data: result };
  } catch (err) {
    console.error("Error rejecting document:", err);
    return { error: "Gagal menolak dokumen" };
  }
}

export async function initiateSigningAction(documentId: string, signerUserIds: string[]) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { error: "Unauthorized" };
    }

    const doc = await getDocumentById(session.user.tenantId, documentId);
    if (!doc) {
      return { error: "Dokumen tidak ditemukan" };
    }

    // Only uploader can initiate signing
    if (doc.uploadedBy !== session.user.id) {
      return { error: "Hanya pembuat dokumen yang bisa memulai tanda tangan" };
    }

    const result = await initiateSigning(session.user.tenantId, documentId, signerUserIds);

    return { data: result };
  } catch (err) {
    console.error("Error initiating signing:", err);
    return { error: "Gagal memulai proses tanda tangan" };
  }
}
