import { requireRole } from "@/server/require-session";
import { SerialLookup } from "@/components/produk/serial-lookup";

export default async function SerialLookupPage() {
  await requireRole(["OWNER", "MANAGER", "STAFF"]);
  return <SerialLookup />;
}
