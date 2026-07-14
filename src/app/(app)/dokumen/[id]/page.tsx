import { requireRole } from "@/server/require-session";
import { getAccessibleDocumentById } from "@/server/services/document-service";
import { DocumentViewer } from "@/components/dokumen/document-viewer";

export default async function DokumenDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);

  const document = await getAccessibleDocumentById(user.tenantId, params.id, user.id, user.role);
  if (!document) {
    return <div className="p-4">Dokumen tidak ditemukan</div>;
  }

  // Check if current user is a signer
  const pendingSigner = document.signers.find(
    (s) => s.userId === user.id && s.status === "PENDING"
  );

  // Check if user can sign (either document uploader or is a signer)
  const canSign =
    document.uploadedBy === user.id ||
    document.signers.some((s) => s.userId === user.id);

  return (
    <DocumentViewer
      document={document}
      currentUserId={user.id}
      canSign={canSign}
      pendingSigner={pendingSigner}
    />
  );
}
