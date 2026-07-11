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
 * bahan baku atau menu jadi lain lewat ProductRecipeItem, mis. Cappuccino =
 * susu+kopi+gula, atau paket/kombo = beberapa menu jadi sekaligus), HPP dihitung
 * dari total modal komponennya — diturunkan rekursif kalau komponennya sendiri
 * juga punya resep (nested) — bukan field `cost` produk itu sendiri (yang
 * biasanya kosong/tidak relevan buat produk racikan). Kalau tidak punya resep,
 * pakai `cost` langsung (barang dagangan biasa, moving-average dari penerimaan
 * barang).
 */
export async function getMenuProfitability(
  tenantId: string,
  outletIds: string[],
  days: number
): Promise<MenuProfitabilityRow[]> {
  const { start, end } = daysAgoRangeJakarta(days);

  const [products, allRecipeItems, saleItems] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId, isActive: true, kind: { in: ["GOODS", "ASSEMBLY"] } },
      select: { id: true, name: true, price: true, cost: true, category: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.productRecipeItem.findMany({
      where: { tenantId },
      select: { productId: true, ingredientId: true, qty: true },
    }),
    prisma.saleItem.findMany({
      where: {
        tenantId,
        sale: { outletId: { in: outletIds }, status: "COMPLETED", createdAt: { gte: start, lt: end } },
      },
      select: { productId: true, qty: true, returnedQty: true, subtotal: true },
    }),
  ]);

  const recipeByProduct = new Map<string, { ingredientId: string; qty: number }[]>();
  for (const item of allRecipeItems) {
    const existing = recipeByProduct.get(item.productId);
    const entry = { ingredientId: item.ingredientId, qty: item.qty };
    if (existing) existing.push(entry);
    else recipeByProduct.set(item.productId, [entry]);
  }

  const costMap = new Map(products.map((p) => [p.id, p.cost ?? 0]));
  const missingCostIds = Array.from(new Set(allRecipeItems.map((r) => r.ingredientId))).filter(
    (id) => !costMap.has(id)
  );
  if (missingCostIds.length > 0) {
    const extraProducts = await prisma.product.findMany({
      where: { id: { in: missingCostIds } },
      select: { id: true, cost: true },
    });
    for (const p of extraProducts) costMap.set(p.id, p.cost ?? 0);
  }

  const hppCache = new Map<string, number>();
  function resolveHpp(productId: string, visited: Set<string>): number {
    if (visited.has(productId)) return 0;
    const cached = hppCache.get(productId);
    if (cached !== undefined) return cached;

    const recipe = recipeByProduct.get(productId);
    let hpp: number;
    if (recipe && recipe.length > 0) {
      const nextVisited = new Set(visited).add(productId);
      hpp = recipe.reduce((sum, r) => sum + resolveHpp(r.ingredientId, nextVisited) * r.qty, 0);
    } else {
      hpp = costMap.get(productId) ?? 0;
    }
    hppCache.set(productId, hpp);
    return hpp;
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
        hpp = resolveHpp(product.id, new Set());
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
