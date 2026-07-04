import { prisma } from "@/lib/prisma";
import type { Document, DocumentSigner, DocumentAccessLevel } from "@prisma/client";

export async function createDocument(
  tenantId: string,
  uploadedBy: string,
  name: string,
  fileUrl: string,
  description?: string,
  expiresAt?: Date
): Promise<Document> {
  return prisma.document.create({
    data: {
      tenantId,
      name,
      description,
      fileUrl,
      uploadedBy,
      expiresAt,
      status: "DRAFT",
    },
    include: {
      versions: true,
      signers: true,
    },
  });
}

export async function getDocumentById(tenantId: string, documentId: string) {
  return prisma.document.findFirst({
    where: { id: documentId, tenantId },
    include: {
      uploader: { select: { id: true, name: true, email: true } },
      versions: {
        include: {
          creator: { select: { id: true, name: true } },
        },
        orderBy: { version: "desc" },
      },
      signers: {
        include: {
          signer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { sequence: "asc" },
      },
      accessControl: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export async function getDocuments(tenantId: string, uploadedBy?: string, status?: string) {
  return prisma.document.findMany({
    where: {
      tenantId,
      ...(uploadedBy && { uploadedBy }),
      ...(status && { status: status as any }),
    },
    include: {
      uploader: { select: { id: true, name: true } },
      signers: { select: { userId: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDocumentsAccessibleByUser(tenantId: string, userId: string, userRole: string) {
  return prisma.document.findMany({
    where: {
      tenantId,
      OR: [
        { uploadedBy: userId },
        {
          accessControl: {
            some: {
              OR: [
                { userId },
                { role: userRole },
              ],
            },
          },
        },
        {
          signers: {
            some: { userId },
          },
        },
      ],
    },
    include: {
      uploader: { select: { id: true, name: true } },
      signers: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateDocumentStatus(
  tenantId: string,
  documentId: string,
  status: string
): Promise<Document> {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return prisma.document.update({
    where: { id: documentId },
    data: { status: status as any },
  });
}

export async function createDocumentVersion(
  tenantId: string,
  documentId: string,
  fileUrl: string,
  createdBy: string
): Promise<any> {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  const maxVersion = doc.versions.length > 0 ? Math.max(...doc.versions.map((v) => v.version)) : 0;

  return prisma.documentVersion.create({
    data: {
      documentId,
      version: maxVersion + 1,
      fileUrl,
      createdBy,
    },
    include: {
      creator: { select: { id: true, name: true } },
    },
  });
}

export async function getDocumentVersions(tenantId: string, documentId: string) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return doc.versions;
}

export async function addDocumentSigner(
  tenantId: string,
  documentId: string,
  userId: string,
  sequence: number
): Promise<DocumentSigner> {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return prisma.documentSigner.create({
    data: {
      documentId,
      userId,
      sequence,
      status: "PENDING",
    },
    include: {
      signer: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getDocumentSigners(tenantId: string, documentId: string) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return doc.signers;
}

export async function getPendingSignatures(tenantId: string, userId: string) {
  return prisma.documentSigner.findMany({
    where: {
      userId,
      status: "PENDING",
      document: { tenantId },
    },
    include: {
      document: {
        select: {
          id: true,
          name: true,
          fileUrl: true,
          uploadedBy: true,
          uploader: { select: { name: true } },
        },
      },
      signer: { select: { id: true, name: true } },
    },
    orderBy: [{ document: { createdAt: "desc" } }],
  });
}

export async function getSigningQueue(tenantId: string, documentId: string) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return doc.signers.sort((a, b) => a.sequence - b.sequence);
}

export async function getNextSigner(tenantId: string, documentId: string) {
  const signers = await getSigningQueue(tenantId, documentId);
  return signers.find((s) => s.status === "PENDING");
}

export async function grantDocumentAccess(
  tenantId: string,
  documentId: string,
  userId?: string,
  role?: string,
  level: DocumentAccessLevel = "VIEWER"
) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return prisma.documentAccess.create({
    data: {
      documentId,
      userId,
      role,
      level,
    },
  });
}

export async function revokeDocumentAccess(
  tenantId: string,
  documentId: string,
  userId?: string
) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  if (!userId) throw new Error("userId required for revoking access");

  return prisma.documentAccess.deleteMany({
    where: {
      documentId,
      userId,
    },
  });
}

export async function getDocumentAccessList(tenantId: string, documentId: string) {
  const doc = await getDocumentById(tenantId, documentId);
  if (!doc) throw new Error("Document not found");

  return doc.accessControl;
}
