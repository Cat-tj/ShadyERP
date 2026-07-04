import { requireRole } from "@/server/require-session";
import { getDocuments } from "@/server/services/document-service";
import { listUsers } from "@/server/services/user-service";
import { DocumentManager, type DocumentRow } from "@/components/dokumen/document-manager";

export default async function DokumenPage() {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);

  const [documents, users] = await Promise.all([
    getDocuments(user.tenantId),
    listUsers(user.tenantId),
  ]);

  const formattedDocs = documents as DocumentRow[];

  return (
    <DocumentManager
      documents={formattedDocs}
      users={users}
      currentUserName={user.name}
    />
  );
}
