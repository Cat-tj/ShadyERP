import { prisma } from "@/lib/prisma";
import type { Prisma, ProductionPlan, MaterialRequest, PurchaseOrder } from "@prisma/client";
import { getWarehouseBalance } from "./stock-movement-service";
type Client = Prisma.TransactionClient | typeof prisma;

async function findRawMaterialWarehouse(tenantId: string, outletId: string, tx: Client = prisma) {
  const warehouse = await tx.warehouse.findFirst({
    where: { tenantId, outletId, type: "RAW_MATERIAL", isActive: true },
  });
  if (!warehouse) throw new Error("Belum ada gudang bahan baku untuk outlet ini — buat dulu di Pengaturan Produksi.");
  return warehouse;
}

export async function createProductionPlan(
  tenantId: string,
  productId: string,
  targetQty: number,
  startDate: Date,
  endDate: Date,
  note?: string
): Promise<ProductionPlan> {
  if (targetQty <= 0) throw new Error("Target produksi harus lebih dari 0.");
  return prisma.productionPlan.create({
    data: {
      tenantId,
      productId,
      targetQty,
      startDate,
      endDate,
      note,
      status: "DRAFT",
    },
  });
}

export async function approveProductionPlan(tenantId: string, planId: string): Promise<ProductionPlan> {
  const plan = await prisma.productionPlan.findFirst({ where: { id: planId, tenantId } });
  if (!plan) throw new Error("Rencana produksi tidak ditemukan.");
  if (plan.status !== "DRAFT") throw new Error("Rencana produksi sudah disetujui atau diproses.");

  return prisma.productionPlan.update({
    where: { id: planId },
    data: { status: "APPROVED" },
  });
}

export interface MRPResult {
  planId: string;
  recommendations: {
    ingredientId: string;
    ingredientName: string;
    grossRequired: number;
    availableStock: number;
    netRequired: number;
    action: "PURCHASE" | "TRANSFER";
    targetSupplierId?: string;
    sourceOutletId?: string;
    poId?: string;
    materialRequestId?: string;
  }[];
}

export async function runMRP(tenantId: string, planId: string, actorId: string): Promise<MRPResult> {
  const plan = await prisma.productionPlan.findFirst({
    where: { id: planId, tenantId },
    include: { product: true },
  });
  if (!plan) throw new Error("Rencana produksi tidak ditemukan.");

  // Ambil BOM aktif untuk produk rencana
  const bom = await prisma.bomVersion.findFirst({
    where: { tenantId, productId: plan.productId, status: "ACTIVE" },
    include: { items: { include: { ingredient: true } } },
  });
  if (!bom) throw new Error("Tidak ada resep (BOM) aktif untuk produk ini.");

  // Ambil outlet default untuk produksi (kita pilih outlet pertama dari tenant sebagai default)
  const defaultOutlet = await prisma.outlet.findFirst({ where: { tenantId } });
  if (!defaultOutlet) throw new Error("Outlet tidak ditemukan.");
  const outletId = defaultOutlet.id;

  const rawWarehouse = await findRawMaterialWarehouse(tenantId, outletId);
  const recommendations: MRPResult["recommendations"] = [];

  await prisma.$transaction(async (tx) => {
    for (const bomItem of bom.items) {
      const grossRequired = plan.targetQty * bomItem.qty;
      const availableStock = await getWarehouseBalance(tenantId, bomItem.ingredientId, rawWarehouse.id);
      const netRequired = grossRequired - availableStock;

      if (netRequired > 0) {
        // Cek jika outlet lain punya stok berlebih (untuk rekomendasi TRANSFER)
        const otherOutlets = await tx.outlet.findMany({
          where: { tenantId, id: { not: outletId } },
        });

        let sourceOutletId: string | undefined;
        for (const other of otherOutlets) {
          try {
            const otherRawWarehouse = await tx.warehouse.findFirst({
              where: { tenantId, outletId: other.id, type: "RAW_MATERIAL", isActive: true },
            });
            if (otherRawWarehouse) {
              const otherBalance = await getWarehouseBalance(tenantId, bomItem.ingredientId, otherRawWarehouse.id);
              if (otherBalance >= netRequired) {
                sourceOutletId = other.id;
                break;
              }
            }
          } catch {
            // Abaikan jika outlet lain belum punya gudang
          }
        }

        if (sourceOutletId) {
          // Buat rekomendasi TRANSFER via MaterialRequest
          const matRequest = await tx.materialRequest.create({
            data: {
              tenantId,
              outletId,
              fromOutletId: sourceOutletId,
              status: "PENDING",
              note: `MRP Auto-generated untuk rencana produksi plan #${planId}`,
              items: {
                create: {
                  tenantId,
                  productId: bomItem.ingredientId,
                  qty: netRequired,
                },
              },
            },
          });

          recommendations.push({
            ingredientId: bomItem.ingredientId,
            ingredientName: bomItem.ingredient.name,
            grossRequired,
            availableStock,
            netRequired,
            action: "TRANSFER",
            sourceOutletId,
            materialRequestId: matRequest.id,
          });
        } else {
          // Buat rekomendasi PURCHASE via PurchaseOrder
          // Cari supplier contract
          let contract = await tx.supplierPricingContract.findFirst({
            where: { tenantId, productId: bomItem.ingredientId, isActive: true },
          });

          let supplierId: string;
          if (contract) {
            supplierId = contract.supplierId;
          } else {
            // Fallback: cari supplier pertama atau buat default supplier
            let supplier = await tx.supplier.findFirst({ where: { tenantId } });
            if (!supplier) {
              supplier = await tx.supplier.create({
                data: {
                  tenantId,
                  name: "Supplier Utama",
                  phone: "08123456789",
                  address: "Kota Produksi",
                },
              });
            }
            supplierId = supplier.id;

            // Buat contract mockup
            contract = await tx.supplierPricingContract.create({
              data: {
                tenantId,
                supplierId,
                productId: bomItem.ingredientId,
                unitPrice: 1000, // default price
                minQty: 1,
                leadDays: 3,
                isActive: true,
              },
            });
          }

          // Buat PurchaseOrder draft
          const po = await tx.purchaseOrder.create({
            data: {
              tenantId,
              supplierId,
              poNumber: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              status: "DRAFT",
              totalAmount: netRequired * contract.unitPrice,
              items: {
                create: {
                  productId: bomItem.ingredientId,
                  qty: netRequired,
                  unitPrice: contract.unitPrice,
                  subtotal: netRequired * contract.unitPrice,
                },
              },
            },
          });

          recommendations.push({
            ingredientId: bomItem.ingredientId,
            ingredientName: bomItem.ingredient.name,
            grossRequired,
            availableStock,
            netRequired,
            action: "PURCHASE",
            targetSupplierId: supplierId,
            poId: po.id,
          });
        }
      }
    }

    // Update status rencana produksi menjadi COMPLETED setelah MRP dijalankan
    await tx.productionPlan.update({
      where: { id: planId },
      data: { status: "COMPLETED" },
    });
  });

  return { planId, recommendations };
}

export async function listProductionPlans(tenantId: string): Promise<ProductionPlan[]> {
  return prisma.productionPlan.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } },
  });
}
