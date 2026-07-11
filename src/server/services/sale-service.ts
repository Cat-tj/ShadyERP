import { prisma } from "@/lib/prisma";
import { buildInvoiceNumber, buildInvoicePrefix } from "@/lib/invoice";
import { computeVariantSelection, loadEffectiveGroupsByProduct } from "@/server/services/product-variant-service";
import { recordAuditLog } from "@/server/services/audit-log-service";
import { formatRupiah } from "@/lib/format";
import { logSaleToJournal, assertPeriodNotLocked } from "@/server/services/accounting-service";
import { consumeBatchFIFO } from "@/server/services/inventory-service";
import { assignSerialToSaleItem, releaseSerialsForSaleItem } from "@/server/services/product-serial-service";
import type { PaymentMethod, OrderType } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export type CartItemInput = {
  productId: string;
  qty: number;
  discountAmount: number;
  /** Pilihan varian (mis. Large, Boba) — dipakai kasir POS, harga dihitung ulang dari opsi. */
  variantOptionIds?: string[];
  /**
   * Dipakai saat Sale dibuat dari TableOrder yang item-itemnya SUDAH punya
   * harga+label varian snapshot — supaya tidak dihitung ulang dari opsi lagi.
   */
  unitPriceOverride?: number;
  variantLabel?: string | null;
  /** Wajib diisi kalau produk trackSerial — satu unit fisik per baris keranjang (qty harus 1). */
  serialNumber?: string;
};

export type CreateSaleInput = {
  tenantId: string;
  outletId: string;
  shiftId: string;
  cashierId: string;
  memberId?: string | null;
  items: CartItemInput[];
  discountAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  orderType?: OrderType;
  cashbackAmount?: number;
  parkingFee?: number;
  /** Tukar stempel member jadi reward gratis (butuh memberId & stempel cukup). */
  redeemStamp?: boolean;
  /**
   * Set `false` kalau stok item-item ini SUDAH dipotong sebelumnya (mis. sudah
   * direservasi saat pesanan QR meja dibuat) — supaya tidak dipotong dua kali.
   * Default `true` untuk alur kasir normal.
   */
  deductStock?: boolean;
};

export async function createSale(input: CreateSaleInput) {
  if (input.items.length === 0) {
    throw new Error("Keranjang masih kosong. Tambahkan produk dulu.");
  }
  const deductStock = input.deductStock ?? true;

  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((item) => item.productId);

    // Fetch resep untuk produk-produk di keranjang
    const recipes = await tx.productRecipeItem.findMany({
      where: { tenantId: input.tenantId, productId: { in: productIds } },
    });
    const ingredientIds = recipes.map((r) => r.ingredientId);

    // Fetch produk + stok produk dan stok bahan baku sekaligus
    const [products, ingredientStocks, variantGroupsByProduct] = await Promise.all([
      tx.product.findMany({
        where: { tenantId: input.tenantId, id: { in: productIds } },
        include: { stocks: { where: { outletId: input.outletId } } },
      }),
      tx.productStock.findMany({
        where: { tenantId: input.tenantId, productId: { in: ingredientIds }, outletId: input.outletId },
        include: { product: true },
      }),
      loadEffectiveGroupsByProduct(tx, input.tenantId, productIds),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const recipeMap = new Map<string, (typeof recipes)[number][]>();
    for (const r of recipes) {
      if (!recipeMap.has(r.productId)) recipeMap.set(r.productId, []);
      recipeMap.get(r.productId)!.push(r);
    }
    const ingredientStockMap = new Map(ingredientStocks.map((s) => [s.productId, s]));

    let subtotal = 0;
    const itemsData: {
      tenantId: string;
      productId: string;
      productName: string;
      variantLabel: string | null;
      price: number;
      qty: number;
      discountAmount: number;
      subtotal: number;
    }[] = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error("Salah satu produk di keranjang sudah tidak tersedia. Muat ulang halaman.");
      }

      const productRecipes = recipeMap.get(item.productId);
      if (deductStock) {
        if (productRecipes && productRecipes.length > 0) {
          for (const recipe of productRecipes) {
            const ingStock = ingredientStockMap.get(recipe.ingredientId);
            const ingQty = ingStock?.qty ?? 0;
            const needed = recipe.qty * item.qty;
            if (ingQty < needed) {
              const ingName = ingStock?.product?.name ?? "Bahan baku";
              throw new Error(
                `Stok bahan baku ${ingName} tidak cukup (sisa ${ingQty}, butuh ${needed}) untuk membuat ${product.name}.`
              );
            }
          }
        } else if (product.trackStock) {
          const stockQty = product.stocks[0]?.qty ?? 0;
          if (stockQty < item.qty) {
            throw new Error(
              `Stok ${product.name} tinggal ${stockQty} — kurangi jumlah atau perbarui stok.`
            );
          }
        }
      }

      if (product.trackSerial) {
        if (item.qty !== 1) {
          throw new Error(`${product.name} dijual per unit (pakai serial/IMEI) — jumlah harus 1 per baris.`);
        }
        if (!item.serialNumber?.trim()) {
          throw new Error(`Pilih serial/IMEI unit untuk ${product.name}.`);
        }
      }

      let unitPrice = product.price;
      let variantLabel: string | null = null;
      if (item.unitPriceOverride !== undefined) {
        unitPrice = item.unitPriceOverride;
        variantLabel = item.variantLabel ?? null;
      } else if ((variantGroupsByProduct.get(product.id) ?? []).length > 0) {
        // Selalu divalidasi kalau produk PUNYA grup varian/modifier — bukan cuma
        // saat variantOptionIds diisi. Kalau tidak, grup yang wajib (required)
        // bisa kelewat tervalidasi ketika keranjang kirim array kosong.
        const resolved = computeVariantSelection(
          variantGroupsByProduct.get(product.id) ?? [],
          item.variantOptionIds ?? []
        );
        unitPrice = product.price + resolved.priceDelta;
        variantLabel = resolved.label;
      }

      const itemSubtotal = unitPrice * item.qty - item.discountAmount;
      subtotal += itemSubtotal;
      itemsData.push({
        tenantId: input.tenantId,
        productId: product.id,
        productName: product.name,
        variantLabel,
        price: unitPrice,
        qty: item.qty,
        discountAmount: item.discountAmount,
        subtotal: itemSubtotal,
      });
    }

    const setting = await tx.tenantSetting.findUnique({ where: { tenantId: input.tenantId } });

    let stampRewardDiscount = 0;
    if (input.redeemStamp) {
      if (!input.memberId) throw new Error("Pilih member dulu untuk tukar stempel.");
      if (!setting?.stampProgramEnabled) throw new Error("Program kartu stempel belum diaktifkan.");
      const memberForStamp = await tx.member.findFirst({
        where: { id: input.memberId, tenantId: input.tenantId },
      });
      if (!memberForStamp) throw new Error("Member tidak ditemukan.");
      if (memberForStamp.stampCount < setting.stampTarget) {
        throw new Error(
          `Stempel ${memberForStamp.name} belum cukup — ${memberForStamp.stampCount}/${setting.stampTarget}.`
        );
      }
      stampRewardDiscount = setting.stampRewardValue;
    }

    const taxPercent = setting?.taxPercent ?? 0;
    const totalDiscountAmount = input.discountAmount + stampRewardDiscount;
    const afterDiscount = subtotal - totalDiscountAmount;
    const taxAmount = Math.round((afterDiscount * taxPercent) / 100);
    const total = afterDiscount + taxAmount;

    if (input.paymentMethod === "CASH" && input.amountPaid < total) {
      throw new Error("Uang diterima kurang dari total belanja.");
    }

    let member = null;
    if (input.paymentMethod === "DEPOSIT") {
      if (!input.memberId) {
        throw new Error("Pilih member dulu untuk bayar pakai saldo deposit.");
      }
      member = await tx.member.findFirst({ where: { id: input.memberId, tenantId: input.tenantId } });
      if (!member) throw new Error("Member tidak ditemukan.");
      if (member.depositBalance < total) {
        throw new Error(
          `Saldo deposit ${member.name} tidak cukup — sisa ${member.depositBalance}, butuh ${total}.`
        );
      }
    }

    const amountPaid = input.paymentMethod === "DEPOSIT" ? total : input.amountPaid;
    const changeAmount = input.paymentMethod === "CASH" ? input.amountPaid - total : 0;

    const now = new Date();
    const ymdPrefix = buildInvoicePrefix(input.outletId, now);
    const countToday = await tx.sale.count({
      where: { tenantId: input.tenantId, outletId: input.outletId, invoiceNumber: { startsWith: ymdPrefix } },
    });
    const invoiceNumber = buildInvoiceNumber(input.outletId, now, countToday + 1);

    const saleRow = await tx.sale.create({
      data: {
        tenantId: input.tenantId,
        outletId: input.outletId,
        shiftId: input.shiftId,
        cashierId: input.cashierId,
        memberId: input.memberId ?? null,
        invoiceNumber,
        subtotal,
        discountAmount: totalDiscountAmount,
        taxAmount,
        total,
        paymentMethod: input.paymentMethod,
        amountPaid,
        changeAmount,
        orderType: input.orderType ?? "DINE_IN",
        cashbackAmount: input.cashbackAmount ?? 0,
        parkingFee: input.parkingFee ?? 0,
        status: "COMPLETED",
      },
    });

    // Dibuat satu-satu (bukan nested create) supaya urutan createdItems[i]
    // selalu berkorelasi 1:1 dengan input.items[i] — dibutuhkan untuk
    // mengaitkan serial/IMEI ke SaleItem yang benar (urutan hasil nested
    // create tidak dijamin sama dengan urutan input).
    const createdItems: Awaited<ReturnType<typeof tx.saleItem.create>>[] = [];
    for (const itemData of itemsData) {
      const created = await tx.saleItem.create({ data: { ...itemData, saleId: saleRow.id } });
      createdItems.push(created);
    }
    for (let i = 0; i < input.items.length; i++) {
      const serialNumber = input.items[i].serialNumber;
      if (serialNumber?.trim()) {
        await assignSerialToSaleItem(input.tenantId, serialNumber, createdItems[i].id, tx);
      }
    }
    const sale = { ...saleRow, items: createdItems };

    if (deductStock) {
      for (const item of input.items) {
        const product = productMap.get(item.productId)!;
        const productRecipes = recipeMap.get(item.productId);

        if (productRecipes && productRecipes.length > 0) {
          for (const recipe of productRecipes) {
            const ingQty = recipe.qty * item.qty;
            await tx.productStock.update({
              where: { productId_outletId: { productId: recipe.ingredientId, outletId: input.outletId } },
              data: { qty: { decrement: ingQty } },
            });
          }
        } else if (product.trackStock) {
          await tx.productStock.update({
            where: { productId_outletId: { productId: item.productId, outletId: input.outletId } },
            data: { qty: { decrement: item.qty } },
          });
          // Produk yang lacak kedaluwarsa (mis. makanan/farmasi) juga potong
          // batch tertua dulu (FIFO), supaya sisa & tanggal exp per batch akurat.
          if (product.trackExpiry) {
            await consumeBatchFIFO(input.tenantId, item.productId, input.outletId, item.qty, tx);
          }
        }
      }
    }

    // Autopilot low stock reorder checks (Only in ADVANCED mode)
    const accountingSetting = await tx.tenantSetting.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (deductStock && accountingSetting?.accountingMode === "ADVANCED") {
      const checkProductIds = new Set<string>();
      for (const item of input.items) {
        const product = productMap.get(item.productId)!;
        const productRecipes = recipeMap.get(item.productId);
        if (productRecipes && productRecipes.length > 0) {
          for (const recipe of productRecipes) {
            checkProductIds.add(recipe.ingredientId);
          }
        } else if (product.trackStock) {
          checkProductIds.add(item.productId);
        }
      }

      for (const pId of checkProductIds) {
        const reorderPoint = await tx.stockReorderPoint.findFirst({
          where: { tenantId: input.tenantId, productId: pId, outletId: input.outletId },
        });

        if (reorderPoint) {
          const stock = await tx.productStock.findUnique({
            where: { productId_outletId: { productId: pId, outletId: input.outletId } },
          });
          const currentQty = stock?.qty ?? 0;

          if (currentQty <= reorderPoint.minQty) {
            const contract = await tx.supplierPricingContract.findFirst({
              where: { tenantId: input.tenantId, productId: pId, isActive: true },
            });
            let supplierId = contract?.supplierId;

            if (!supplierId) {
              const firstSupplier = await tx.supplier.findFirst({
                where: { tenantId: input.tenantId, status: "ACTIVE" },
              });
              supplierId = firstSupplier?.id;
            }

            if (supplierId) {
              let po = await tx.purchaseOrder.findFirst({
                where: { tenantId: input.tenantId, supplierId, status: "DRAFT" },
                include: { items: true },
              });

              if (!po) {
                const today = new Date();
                const count = await tx.purchaseOrder.count({ where: { tenantId: input.tenantId } });
                const poNumber = `PO-${today.getFullYear()}${(today.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}-${String(count + 1).padStart(3, "0")}`;

                po = await tx.purchaseOrder.create({
                  data: {
                    tenantId: input.tenantId,
                    supplierId,
                    poNumber,
                    status: "DRAFT",
                    totalAmount: 0,
                    expectedAt: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
                  },
                  include: { items: true },
                });
              }

              const hasItem = po.items.some((i: { productId: string }) => i.productId === pId);
              if (!hasItem) {
                const reorderQty = contract?.minQty ?? 10;
                const productObj = await tx.product.findUnique({
                  where: { id: pId },
                  select: { cost: true },
                });
                const unitPrice = contract?.unitPrice ?? productObj?.cost ?? 0;

                await tx.purchaseOrderItem.create({
                  data: {
                    poId: po.id,
                    productId: pId,
                    qty: reorderQty,
                    unitPrice,
                    subtotal: reorderQty * unitPrice,
                  },
                });

                // Update PO totalAmount
                await tx.purchaseOrder.update({
                  where: { id: po.id },
                  data: {
                    totalAmount: { increment: reorderQty * unitPrice },
                  },
                });
              }
            }
          }
        }
      }
    }

    if (member) {
      await tx.member.update({
        where: { id: member.id },
        data: { depositBalance: { decrement: total } },
      });
    }

    if (input.memberId) {
      const points = Math.floor(total / (setting?.pointsPerAmount ?? 10000));
      if (points > 0) {
        await tx.pointTransaction.create({
          data: {
            tenantId: input.tenantId,
            memberId: input.memberId,
            type: "EARN",
            points,
            saleId: sale.id,
            note: `Poin dari transaksi ${invoiceNumber}`,
          },
        });
        await tx.member.update({
          where: { id: input.memberId },
          data: { points: { increment: points } },
        });
      }
    }

    if (input.memberId && setting?.stampProgramEnabled) {
      if (input.redeemStamp) {
        await tx.stampTransaction.create({
          data: {
            tenantId: input.tenantId,
            memberId: input.memberId,
            type: "REDEEM",
            count: -setting.stampTarget,
            saleId: sale.id,
            note: `Tukar stempel: ${setting.stampRewardName ?? "reward"} (transaksi ${invoiceNumber})`,
          },
        });
      }
      await tx.stampTransaction.create({
        data: {
          tenantId: input.tenantId,
          memberId: input.memberId,
          type: "EARN",
          count: 1,
          saleId: sale.id,
          note: `Stempel dari transaksi ${invoiceNumber}`,
        },
      });
      const stampDelta = 1 - (input.redeemStamp ? setting.stampTarget : 0);
      await tx.member.update({
        where: { id: input.memberId },
        data: { stampCount: { increment: stampDelta } },
      });
    }

    // Auto-post to accounting journal
    await logSaleToJournal(input.tenantId, sale.id, tx);

    return sale;
  }, { timeout: 15000 });
}

export async function getSaleById(tenantId: string, saleId: string) {
  return prisma.sale.findFirst({
    where: { id: saleId, tenantId },
    include: {
      items: true,
      outlet: true,
      cashier: true,
      member: true,
      saleReturns: { include: { items: true, processedBy: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listSales(tenantId: string, outletIds: string[], take = 50) {
  return prisma.sale.findMany({
    where: { tenantId, outletId: { in: outletIds } },
    include: { cashier: true, member: true, items: true, outlet: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function voidSale(tenantId: string, saleId: string, reason: string, voidedById: string) {
  if (!reason.trim()) {
    throw new Error("Alasan pembatalan wajib diisi.");
  }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { items: true },
    });
    if (!sale) throw new Error("Transaksi tidak ditemukan.");
    if (sale.status === "VOIDED") throw new Error("Transaksi ini sudah dibatalkan sebelumnya.");
    await assertPeriodNotLocked(tenantId, sale.createdAt, tx);

    await recordAuditLog(
      tx,
      tenantId,
      voidedById,
      "SALE_VOID",
      `Membatalkan transaksi ${sale.invoiceNumber} (${formatRupiah(sale.total)}) — alasan: ${reason}`
    );

    for (const item of sale.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product?.trackStock) {
        await tx.productStock.updateMany({
          where: { productId: item.productId, outletId: sale.outletId },
          data: { qty: { increment: item.qty } },
        });
      }
      if (product?.trackSerial) {
        await releaseSerialsForSaleItem(tenantId, item.id, tx);
      }
    }

    if (sale.memberId) {
      const earnTx = await tx.pointTransaction.findFirst({
        where: { saleId: sale.id, type: "EARN" },
      });
      if (earnTx && earnTx.points > 0) {
        await tx.pointTransaction.create({
          data: {
            tenantId,
            memberId: sale.memberId,
            type: "ADJUST",
            points: -earnTx.points,
            saleId: sale.id,
            note: `Pembatalan transaksi ${sale.invoiceNumber}`,
          },
        });
        await tx.member.update({
          where: { id: sale.memberId },
          data: { points: { decrement: earnTx.points } },
        });
      }

      const stampTxs = await tx.stampTransaction.findMany({
        where: { saleId: sale.id, type: { in: ["EARN", "REDEEM"] } },
      });
      const netStampDelta = stampTxs.reduce((sum, t) => sum + t.count, 0);
      if (netStampDelta !== 0) {
        await tx.stampTransaction.create({
          data: {
            tenantId,
            memberId: sale.memberId,
            type: "ADJUST",
            count: -netStampDelta,
            saleId: sale.id,
            note: `Pembatalan transaksi ${sale.invoiceNumber}`,
          },
        });
        await tx.member.update({
          where: { id: sale.memberId },
          data: { stampCount: { decrement: netStampDelta } },
        });
      }
    }

    return tx.sale.update({
      where: { id: sale.id },
      data: { status: "VOIDED", voidReason: reason },
    });
  });
}

export async function correctSalePaymentMethod(
  tenantId: string,
  saleId: string,
  paymentMethod: Exclude<PaymentMethod, "DEPOSIT">,
  reason: string,
  changedById: string
) {
  if (!reason.trim()) throw new Error("Alasan koreksi wajib diisi.");

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({ where: { id: saleId, tenantId } });
    if (!sale) throw new Error("Transaksi tidak ditemukan.");
    if (sale.status === "VOIDED") throw new Error("Transaksi batal tidak bisa dikoreksi.");
    if (sale.paymentMethod === "DEPOSIT") {
      throw new Error("Transaksi deposit tidak bisa dikoreksi dari sini karena memengaruhi saldo member.");
    }
    if (sale.paymentMethod === paymentMethod) return sale;

    await recordAuditLog(
      tx,
      tenantId,
      changedById,
      "SALE_PAYMENT_CORRECTION",
      `Koreksi metode bayar ${sale.invoiceNumber}: ${sale.paymentMethod} → ${paymentMethod} — alasan: ${reason}`
    );

    return tx.sale.update({
      where: { id: sale.id },
      data: {
        paymentMethod,
        amountPaid: sale.total,
        changeAmount: 0,
      },
    });
  });
}

export type ReturnItemInput = { saleItemId: string; qty: number };

/**
 * Retur sebagian item dari transaksi yang sudah selesai. Beda dengan voidSale
 * (membatalkan seluruh transaksi) — ini cuma mengembalikan sebagian item.
 */
export async function processReturn(
  tenantId: string,
  saleId: string,
  processedById: string,
  items: ReturnItemInput[],
  reason: string,
  refundMethod: string = "CASH"
) {
  if (!reason.trim()) {
    throw new Error("Alasan retur wajib diisi.");
  }
  if (items.length === 0) {
    throw new Error("Pilih minimal satu item untuk diretur.");
  }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { items: true },
    });
    if (!sale) throw new Error("Transaksi tidak ditemukan.");
    if (sale.status === "VOIDED") {
      throw new Error("Transaksi ini sudah dibatalkan, tidak bisa diretur.");
    }
    await assertPeriodNotLocked(tenantId, sale.createdAt, tx);

    const saleItemMap = new Map(sale.items.map((i) => [i.id, i]));
    let totalRefund = 0;
    const returnItemsData: { tenantId: string; saleItemId: string; qty: number; refundAmount: number }[] = [];

    for (const input of items) {
      const saleItem = saleItemMap.get(input.saleItemId);
      if (!saleItem) throw new Error("Item transaksi tidak ditemukan.");
      if (input.qty <= 0) continue;
      const sisaBisaDiretur = saleItem.qty - saleItem.returnedQty;
      if (input.qty > sisaBisaDiretur) {
        throw new Error(
          `${saleItem.productName}: maksimal bisa diretur ${sisaBisaDiretur}, kamu masukkan ${input.qty}.`
        );
      }
      const netPerUnit = saleItem.subtotal / saleItem.qty;
      const refundAmount = Math.round(netPerUnit * input.qty);
      totalRefund += refundAmount;
      returnItemsData.push({ tenantId, saleItemId: saleItem.id, qty: input.qty, refundAmount });
    }

    if (returnItemsData.length === 0) {
      throw new Error("Pilih minimal satu item dengan jumlah retur lebih dari 0.");
    }

    await recordAuditLog(
      tx,
      tenantId,
      processedById,
      "SALE_RETURN",
      `Retur ${returnItemsData.length} item dari transaksi ${sale.invoiceNumber} (${formatRupiah(totalRefund)}) lewat ${refundMethod} — alasan: ${reason}`
    );

    const openShift = await tx.cashierShift.findFirst({
      where: {
        tenantId,
        userId: processedById,
        outletId: sale.outletId,
        status: "OPEN",
      },
    });

    const saleReturn = await tx.saleReturn.create({
      data: {
        tenantId,
        saleId: sale.id,
        processedById,
        shiftId: openShift?.id ?? null,
        reason,
        totalRefund,
        refundMethod,
        items: { create: returnItemsData },
      },
      include: { items: true },
    });

    for (const returnItem of returnItemsData) {
      const saleItem = saleItemMap.get(returnItem.saleItemId)!;
      await tx.saleItem.update({
        where: { id: saleItem.id },
        data: { returnedQty: { increment: returnItem.qty } },
      });
      const product = await tx.product.findUnique({ where: { id: saleItem.productId } });
      if (product?.trackStock) {
        await tx.productStock.updateMany({
          where: { productId: saleItem.productId, outletId: sale.outletId },
          data: { qty: { increment: returnItem.qty } },
        });
      }
      // trackSerial selalu qty=1 per baris — retur baris ini berarti unitnya utuh dikembalikan.
      if (product?.trackSerial) {
        await releaseSerialsForSaleItem(tenantId, saleItem.id, tx);
      }
    }

    if (sale.memberId && refundMethod === "DEPOSIT" && totalRefund > 0) {
      await tx.member.update({
        where: { id: sale.memberId },
        data: { depositBalance: { increment: totalRefund } },
      });
    }

    if (sale.memberId && sale.total > 0) {
      const earnTx = await tx.pointTransaction.findFirst({
        where: { saleId: sale.id, type: "EARN" },
      });
      if (earnTx && earnTx.points > 0) {
        const pointsToReverse = Math.floor((earnTx.points * totalRefund) / sale.total);
        if (pointsToReverse > 0) {
          const member = await tx.member.findUnique({ where: { id: sale.memberId } });
          const actualReverse = Math.min(pointsToReverse, member?.points ?? 0);
          if (actualReverse > 0) {
            await tx.pointTransaction.create({
              data: {
                tenantId,
                memberId: sale.memberId,
                type: "ADJUST",
                points: -actualReverse,
                saleId: sale.id,
                note: `Koreksi poin dari retur transaksi ${sale.invoiceNumber}`,
              },
            });
            await tx.member.update({
              where: { id: sale.memberId },
              data: { points: { decrement: actualReverse } },
            });
          }
        }
      }
    }

    return saleReturn;
  });
}
