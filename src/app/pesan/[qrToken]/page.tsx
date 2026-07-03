import { getTableByQrToken } from "@/server/services/table-service";
import { listProductsWithStock, listCategories } from "@/server/services/product-service";
import { getOpenOrderForTable } from "@/server/services/table-order-service";
import { OrderMenu } from "@/components/table-order/order-menu";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AlertTriangleIcon } from "@/components/ui/icons";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-backdrop flex min-h-screen items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <GlassPanel strong className="w-full max-w-sm rounded-xl p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
        <AlertTriangleIcon aria-hidden className="h-6 w-6" />
      </div>
      <h1 className="font-display text-lg font-semibold text-[var(--color-text)]">{title}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
    </GlassPanel>
  );
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken } = await params;
  const table = await getTableByQrToken(qrToken);

  if (!table) {
    return (
      <Shell>
        <InfoCard
          title="Meja tidak ditemukan"
          description="Kode QR ini tidak valid. Pastikan kamu scan QR asli di meja, atau panggil staff."
        />
      </Shell>
    );
  }

  if (!table.isActive) {
    return (
      <Shell>
        <InfoCard title="Meja tidak aktif" description="Panggil staff untuk bantuan pemesanan." />
      </Shell>
    );
  }

  const [products, categories, openOrder] = await Promise.all([
    listProductsWithStock(table.tenantId, table.outletId),
    listCategories(table.tenantId),
    getOpenOrderForTable(qrToken),
  ]);
  const activeProducts = products.filter((product) => product.isActive);

  return (
    <OrderMenu
      qrToken={qrToken}
      tableName={table.name}
      outletName={table.outlet.name}
      openBill={
        openOrder
          ? {
              items: openOrder.items.map((item) => ({
                id: item.id,
                productName: item.productName,
                variantLabel: item.variantLabel,
                price: item.price,
                qty: item.qty,
              })),
            }
          : null
      }
      products={activeProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        categoryName: product.category?.name ?? null,
        trackStock: product.trackStock,
        stockQty: product.stockQty,
        variantGroups: product.variantGroups.map((group) => ({
          id: group.id,
          name: group.name,
          type: group.type,
          required: group.required,
          options: group.options.map((option) => ({
            id: option.id,
            name: option.name,
            priceDelta: option.priceDelta,
          })),
        })),
      }))}
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
    />
  );
}
