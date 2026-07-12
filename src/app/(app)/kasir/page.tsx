import { requireSession } from "@/server/require-session";
import { getOpenShift } from "@/server/services/shift-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import {
  listProductsWithStock,
  listCategories,
  getUnsellableProductIds,
  logProductUnavailability,
} from "@/server/services/product-service";
import { getActivePromosNow } from "@/server/services/promo-service";
import { loadEffectiveGroupsByProduct } from "@/server/services/product-variant-service";
import { listChannelPricingRules } from "@/server/services/channel-pricing-service";
import { prisma } from "@/lib/prisma";
import { OpenShiftForm } from "@/components/kasir/open-shift-form";
import { PosScreen } from "@/components/kasir/pos-screen";

export default async function KasirPage() {
  const user = await requireSession();
  const shift = await getOpenShift(user.tenantId, user.id);

  if (!shift) {
    const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
    return (
      <div className="mx-auto max-w-5xl">
        <OpenShiftForm outlets={outlets} />
      </div>
    );
  }

  const [products, categories, setting, activePromos, channelPricingRules, unsellableProductIds] = await Promise.all([
    listProductsWithStock(user.tenantId, shift.outletId),
    listCategories(user.tenantId),
    prisma.tenantSetting.findUnique({ where: { tenantId: user.tenantId } }),
    getActivePromosNow(user.tenantId),
    listChannelPricingRules(user.tenantId),
    getUnsellableProductIds(user.tenantId, shift.outletId),
  ]);

  await logProductUnavailability(user.tenantId, shift.outletId, Array.from(unsellableProductIds));

  const activeProducts = products.filter((product) => product.isActive);
  const effectiveGroupsByProduct = await loadEffectiveGroupsByProduct(
    prisma,
    user.tenantId,
    activeProducts.map((product) => product.id)
  );

  return (
    <PosScreen
      outletName={shift.outlet.name}
      taxPercent={setting?.taxPercent ?? 0}
      staticQrisPayload={setting?.staticQrisPayload ?? null}
      stampProgram={{
        enabled: setting?.stampProgramEnabled ?? false,
        target: setting?.stampTarget ?? 10,
        rewardName: setting?.stampRewardName ?? null,
        rewardValue: setting?.stampRewardValue ?? 0,
      }}
      channelMarkupByOrderType={Object.fromEntries(
        channelPricingRules.map((rule) => [rule.orderType, rule.markupPercent])
      )}
      products={activeProducts.map((product) => ({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        sku: product.sku,
        price: product.price,
        categoryId: product.categoryId,
        categoryName: product.category?.name ?? null,
        trackStock: product.trackStock,
        trackSerial: product.trackSerial,
        stockQty: product.stockQty,
        variantGroups: effectiveGroupsByProduct.get(product.id) ?? [],
        recipeUnavailable: unsellableProductIds.has(product.id),
      }))}
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      promos={activePromos.map((promo) => ({
        id: promo.id,
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        scope: promo.scope,
        categoryId: promo.categoryId,
        minSpend: promo.minSpend,
      }))}
    />
  );
}
