import { requireRole } from "@/server/require-session";
import { listCategories, listProductsFull } from "@/server/services/product-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { ProdukManager } from "@/components/produk/produk-manager";

export default async function ProdukPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [categories, products, outlets] = await Promise.all([
    listCategories(user.tenantId),
    listProductsFull(user.tenantId),
    listOutletsForUser(user.tenantId, user.id, user.role),
  ]);

  return (
    <ProdukManager
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        categoryName: product.category?.name ?? null,
        price: product.price,
        cost: product.cost,
        trackStock: product.trackStock,
        isActive: product.isActive,
        stockByOutlet: Object.fromEntries(
          product.stocks.map((stock) => [stock.outletId, stock.qty])
        ),
      }))}
    />
  );
}
