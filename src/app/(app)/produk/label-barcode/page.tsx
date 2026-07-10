import { requireSessionWithTenant } from "@/server/require-session";
import { listProductsFull } from "@/server/services/product-service";
import { LabelBarcodeManager } from "@/components/produk/label-barcode-manager";
import { redirect } from "next/navigation";

export default async function LabelBarcodePage() {
  const { user, tenant } = await requireSessionWithTenant();
  if (user.role === "STAFF") redirect("/pilih-aplikasi");

  const products = await listProductsFull(user.tenantId);

  return (
    <LabelBarcodeManager
      products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, price: p.price }))}
      tenantName={tenant?.name ?? "Toko"}
    />
  );
}
