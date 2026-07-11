import { prisma } from "@/lib/prisma";
import { daysAgoRangeJakarta } from "@/lib/date-range";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export type MenuProfitabilityRow = {
  productId: string;
  productName: string;
  categoryName: string;
  price: number;
  hpp: number;
  hppSource: "resep" | "modal" | "belum-ada";
  marginRp: number;
  marginPercent: number;
  qtyTerjual: number;
  totalOmzet: number;
  totalHpp: number;
  totalProfit: number;
};

/**
 * HPP (harga pokok penjualan) per produk: kalau produk punya resep (dibuat dari
 * bahan baku lewat ProductRecipeItem, mis. Cappuccino = susu+kopi+gula), HPP
 * dihitung dari total modal bahan-bahannya — bukan field `cost` produk itu
 * sendiri (yang biasanya kosong/tidak relevan buat produk racikan). Kalau tidak
 * punya resep, pakai `cost` langsung (barang dagangan biasa, moving-average
 * dari penerimaan barang).
 */
export async function getMenuProfitability(
  tenantId: string,
  outletIds: string[],
  days: number
): Promise<MenuProfitabilityRow[]> {
  const { start, end } = daysAgoRangeJakarta(days);

  const [products, recipeItems, saleItems] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId, isActive: true, kind: { in: ["GOODS", "ASSEMBLY"] } },
      select: { id: true, name: true, price: true, cost: true, category: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.productRecipeItem.findMany({
      where: { tenantId },
      select: { productId: true, qty: true, ingredient: { select: { cost: true } } },
    }),
    prisma.saleItem.findMany({
      where: {
        tenantId,
        sale: { outletId: { in: outletIds }, status: "COMPLETED", createdAt: { gte: start, lt: end } },
      },
      select: { productId: true, qty: true, returnedQty: true, subtotal: true },
    }),
  ]);

  const recipeByProduct = new Map<string, { qty: number; ingredientCost: number }[]>();
  for (const item of recipeItems) {
    const existing = recipeByProduct.get(item.productId);
    const entry = { qty: item.qty, ingredientCost: item.ingredient.cost ?? 0 };
    if (existing) existing.push(entry);
    else recipeByProduct.set(item.productId, [entry]);
  }

  const salesByProduct = new Map<string, { qty: number; omzet: number }>();
  for (const item of saleItems) {
    const sellableQty = Math.max(0, item.qty - item.returnedQty);
    if (sellableQty <= 0) continue;
    const netOmzet = item.qty > 0 ? Math.round((item.subtotal / item.qty) * sellableQty) : 0;
    const existing = salesByProduct.get(item.productId) ?? { qty: 0, omzet: 0 };
    existing.qty += sellableQty;
    existing.omzet += netOmzet;
    salesByProduct.set(item.productId, existing);
  }

  return products
    .map((product): MenuProfitabilityRow => {
      const recipe = recipeByProduct.get(product.id);
      let hpp: number;
      let hppSource: MenuProfitabilityRow["hppSource"];
      if (recipe && recipe.length > 0) {
        hpp = recipe.reduce((sum, r) => sum + r.ingredientCost * r.qty, 0);
        hppSource = "resep";
      } else if (product.cost) {
        hpp = product.cost;
        hppSource = "modal";
      } else {
        hpp = 0;
        hppSource = "belum-ada";
      }

      const marginRp = product.price - hpp;
      const marginPercent = product.price > 0 ? Math.round((marginRp / product.price) * 1000) / 10 : 0;
      const sales = salesByProduct.get(product.id) ?? { qty: 0, omzet: 0 };
      const totalHpp = hpp * sales.qty;

      return {
        productId: product.id,
        productName: product.name,
        categoryName: product.category?.name ?? "Tanpa kategori",
        price: product.price,
        hpp,
        hppSource,
        marginRp,
        marginPercent,
        qtyTerjual: sales.qty,
        totalOmzet: sales.omzet,
        totalHpp,
        totalProfit: sales.omzet - totalHpp,
      };
    })
    .sort((a, b) => a.marginPercent - b.marginPercent);
}
