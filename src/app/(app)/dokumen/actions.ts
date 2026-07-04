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

    // TODO: Upload file to Supabase Storage
    // For now, using a placeholder URL
    const fileUrl = `/uploads/${Date.now()}-${file.name}`;

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

    // TODO: Delete file from Supabase Storage
    // await supabaseClient.storage.from("documents").remove([doc.fileUrl]);

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
