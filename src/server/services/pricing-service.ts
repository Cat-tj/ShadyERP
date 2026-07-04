import { prisma } from "@/lib/prisma";
import type { SupplierPricingContract } from "@prisma/client";

// ==================== SUPPLIER PRICING CONTRACTS ====================

export async function createSupplierPricingContract(
  tenantId: string,
  supplierId: string,
  productId: string,
  unitPrice: number,
  minQty: number = 1,
  leadDays: number = 3
): Promise<SupplierPricingContract> {
  return prisma.supplierPricingContract.upsert({
    where: {
      supplierId_productId: {
        supplierId,
        productId,
      },
    },
    update: {
      unitPrice,
      minQty,
      leadDays,
    },
    create: {
      tenantId,
      supplierId,
      productId,
      unitPrice,
      minQty,
      leadDays,
      isActive: true,
    },
  });
}

export async function getSupplierPricingContracts(
  tenantId: string,
  supplierId: string,
  productId?: string
) {
  return prisma.supplierPricingContract.findMany({
    where: {
      tenantId,
      supplierId,
      ...(productId && { productId }),
      isActive: true,
    },
    include: {
      product: true,
      supplier: true,
    },
  });
}

export async function getProductSupplierOptions(tenantId: string, productId: string) {
  return prisma.supplierPricingContract.findMany({
    where: {
      tenantId,
      productId,
      isActive: true,
    },
    include: {
      supplier: true,
    },
    orderBy: { unitPrice: "asc" },
  });
}

export async function getBestSupplierPrice(
  tenantId: string,
  productId: string,
  qty: number
) {
  const contracts = await getProductSupplierOptions(tenantId, productId);

  // Find the supplier with best price for the given quantity
  const suitable = contracts.filter((c) => c.minQty <= qty);

  if (suitable.length === 0) {
    // No supplier has MOQ <= qty, use cheapest
    return contracts[0] || null;
  }

  return suitable.reduce((best, current) =>
    current.unitPrice < best.unitPrice ? current : best
  );
}

export async function deactivateSupplierContract(
  tenantId: string,
  supplierId: string,
  productId: string
): Promise<void> {
  await prisma.supplierPricingContract.updateMany({
    where: {
      tenantId,
      supplierId,
      productId,
    },
    data: { isActive: false },
  });
}

// ==================== PRODUCT COST MANAGEMENT ====================

export async function updateProductCost(
  tenantId: string,
  productId: string,
  newCost: number,
  reason?: string,
  changedById?: string
): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { cost: true },
  });

  if (!product) throw new Error("Product not found");

  // Record history
  await prisma.productCostHistory.create({
    data: {
      tenantId,
      productId,
      previousCost: product.cost,
      newCost,
      reason,
      changedBy: changedById,
    },
  });

  // Update product
  await prisma.product.update({
    where: { id: productId },
    data: { cost: newCost },
  });
}

export async function getCostHistory(tenantId: string, productId: string) {
  return prisma.productCostHistory.findMany({
    where: {
      tenantId,
      productId,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function calculateProfit(
  tenantId: string,
  productId: string
): Promise<{ sellPrice: number; cost: number; profit: number; margin: number } | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, cost: true },
  });

  if (!product) return null;

  const profit = product.price - (product.cost || 0);
  const margin = product.cost ? Math.round((profit / product.cost) * 100) : 0;

  return {
    sellPrice: product.price,
    cost: product.cost || 0,
    profit,
    margin,
  };
}

export async function calculateBulkProfits(tenantId: string, productIds: string[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId },
    select: { id: true, name: true, price: true, cost: true },
  });

  return products.map((p) => {
    const profit = p.price - (p.cost || 0);
    const margin = p.cost ? Math.round((profit / p.cost) * 100) : 0;
    return {
      productId: p.id,
      productName: p.name,
      sellPrice: p.price,
      cost: p.cost || 0,
      profit,
      margin,
    };
  });
}

// ==================== PRICING ANALYTICS ====================

export async function getLowMarginProducts(tenantId: string, minMarginPercent: number = 20) {
  const products = await prisma.product.findMany({
    where: { tenantId, trackStock: true },
    select: { id: true, name: true, price: true, cost: true },
  });

  return products
    .map((p) => {
      const margin = p.cost ? (((p.price - p.cost) / p.cost) * 100) : 0;
      return {
        productId: p.id,
        productName: p.name,
        price: p.price,
        cost: p.cost || 0,
        margin: Math.round(margin),
      };
    })
    .filter((p) => p.margin < minMarginPercent)
    .sort((a, b) => a.margin - b.margin);
}

export async function getSupplierPricingStats(tenantId: string, supplierId: string) {
  const contracts = await getSupplierPricingContracts(tenantId, supplierId);

  const totalProducts = contracts.length;
  const avgPrice = contracts.length > 0
    ? Math.round(contracts.reduce((sum, c) => sum + c.unitPrice, 0) / contracts.length)
    : 0;
  const minPrice = contracts.length > 0
    ? Math.min(...contracts.map((c) => c.unitPrice))
    : 0;
  const maxPrice = contracts.length > 0
    ? Math.max(...contracts.map((c) => c.unitPrice))
    : 0;

  return {
    totalProducts,
    avgPrice,
    minPrice,
    maxPrice,
    contracts,
  };
}
