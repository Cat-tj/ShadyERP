import { prisma } from "@/lib/prisma";
import type { DocumentSigner } from "@prisma/client";
import { getDocumentById, getSigningQueue } from "./document-service";

export async function signDocument(
  tenantId: string,
  documentId: string,
  userId: string,
  signatureData: string
): Promise<DocumentSigner> {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  const signer = doc.signers.find((s) => s.userId === userId);
  if (!signer) throw new Error("User is not a signer for this document");
  if (signer.status !== "PENDING") throw new Error("This signature is not pending");

  // Update signer status
  const updated = await prisma.documentSigner.update({
    where: { id: signer.id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signatureData,
    },
    include: {
      signer: { select: { id: true, name: true, email: true } },
    },
  });

  // Check if all signers are done (all signed)
  const allSigners = await getSigningQueue(tenantId, documentId);
  const allSigned = allSigners.every(
    (s) => s.status === "SIGNED" || s.status === "SKIPPED"
  );

  if (allSigned) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "SIGNED" },
    });
  } else {
    // Check if document status should be IN_PROGRESS
    const hasSigned = allSigners.some((s) => s.status === "SIGNED");
    if (hasSigned) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "IN_PROGRESS" },
      });
    }
  }

  return updated;
}

export async function rejectDocument(
  tenantId: string,
  documentId: string,
  userId: string,
  reason: string
): Promise<DocumentSigner> {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  const signer = doc.signers.find((s) => s.userId === userId);
  if (!signer) throw new Error("User is not a signer for this document");
  if (signer.status !== "PENDING") throw new Error("This signature is not pending");

  const updated = await prisma.documentSigner.update({
    where: { id: signer.id },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
    },
    include: {
      signer: { select: { id: true, name: true, email: true } },
    },
  });

  // Update document status to REJECTED
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "REJECTED" },
  });

  return updated;
}

export async function skipSigner(
  tenantId: string,
  documentId: string,
  userId: string,
  skippedBy: string
): Promise<DocumentSigner> {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  // Only document uploader can skip signers
  if (doc.uploadedBy !== skippedBy) {
    throw new Error("Only document uploader can skip signers");
  }

  const signer = doc.signers.find((s) => s.userId === userId);
  if (!signer) throw new Error("User is not a signer for this document");
  if (signer.status !== "PENDING") throw new Error("This signature is not pending");

  return prisma.documentSigner.update({
    where: { id: signer.id },
    data: {
      status: "SKIPPED",
    },
    include: {
      signer: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getSigningProgress(tenantId: string, documentId: string) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  const total = doc.signers.length;
  const signed = doc.signers.filter((s) => s.status === "SIGNED").length;
  const pending = doc.signers.filter((s) => s.status === "PENDING").length;
  const rejected = doc.signers.filter((s) => s.status === "REJECTED").length;
  const skipped = doc.signers.filter((s) => s.status === "SKIPPED").length;

  return {
    total,
    signed,
    pending,
    rejected,
    skipped,
    progress: Math.round(((signed + rejected + skipped) / total) * 100),
    isComplete: pending === 0,
    isRejected: rejected > 0,
  };
}

export async function initiateSigning(
  tenantId: string,
  documentId: string,
  signerUserIds: string[]
) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  const uniqueSignerIds = [...new Set(signerUserIds)];
  if (uniqueSignerIds.length === 0) throw new Error("Pilih minimal satu penandatangan.");
  if (uniqueSignerIds.length !== signerUserIds.length) throw new Error("Penandatangan tidak boleh duplikat.");

  const validUsers = await prisma.user.findMany({
    where: { tenantId, id: { in: uniqueSignerIds }, isActive: true },
    select: { id: true },
  });
  if (validUsers.length !== uniqueSignerIds.length) {
    throw new Error("Salah satu penandatangan tidak aktif atau bukan bagian dari tenant ini.");
  }

  const existingSigner = await prisma.documentSigner.findFirst({ where: { documentId, userId: { in: uniqueSignerIds } } });
  if (existingSigner) throw new Error("Penandatangan sudah ada di dokumen ini.");

  return prisma.$transaction(async (tx) => {
    await tx.document.update({
      where: { id: documentId },
      data: { status: "PENDING_SIGNATURE" },
    });

    return Promise.all(
      uniqueSignerIds.map((userId, index) =>
        tx.documentSigner.create({
        data: {
          documentId,
          userId,
          sequence: index + 1,
          status: "PENDING",
        },
        include: {
          signer: { select: { id: true, name: true, email: true } },
        },
      })
      )
    );
  });
}

export async function getDocumentSigningHistory(tenantId: string, documentId: string) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return doc.signers.map((signer) => ({
    userId: signer.userId,
    name: signer.signer.name,
    email: signer.signer.email,
    sequence: signer.sequence,
    status: signer.status,
    signedAt: signer.signedAt,
    rejectionReason: signer.rejectionReason,
  }));
}
