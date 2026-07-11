"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { buildDynamicQris, normalizeStaticQrisPayload } from "@/lib/qris-dynamic";
import {
  updateTenantBusinessType,
  updateTenantSetting,
  type TenantSettingInput,
} from "@/server/services/tenant-service";
import { setChannelPricingRule } from "@/server/services/channel-pricing-service";
import { BUSINESS_MODE_MAP, type BusinessModeKey } from "@/lib/business-modes";
import type { OrderType } from "@prisma/client";

export type ActionResult = { error?: string; success?: boolean };

export async function updateTenantSettingAction(
  input: TenantSettingInput & {
    businessType?: BusinessModeKey;
    channelMarkups?: Partial<Record<OrderType, number>>;
  }
): Promise<ActionResult> {
  const user = await requireRole(["OWNER"]);
  let staticQrisPayload = input.staticQrisPayload?.trim() || null;
  if (input.businessType && !BUSINESS_MODE_MAP[input.businessType]) {
    return { error: "Mode Altora tidak valid." };
  }
  if (!Number.isFinite(input.taxPercent) || input.taxPercent < 0 || input.taxPercent > 100) {
    return { error: "Pajak harus antara 0-100%." };
  }
  if (!Number.isFinite(input.pointsPerAmount) || input.pointsPerAmount <= 0) {
    return { error: "Rasio poin harus lebih dari 0." };
  }
  if (input.channelMarkups) {
    for (const markupPercent of Object.values(input.channelMarkups)) {
      if (!Number.isFinite(markupPercent) || (markupPercent as number) < -100 || (markupPercent as number) > 500) {
        return { error: "Markup harga channel harus antara -100% sampai 500%." };
      }
    }
  }
  if (input.stampProgramEnabled) {
    if (!Number.isFinite(input.stampTarget) || (input.stampTarget ?? 0) <= 0) {
      return { error: "Target stempel harus lebih dari 0." };
    }
    if (!Number.isFinite(input.stampRewardValue) || (input.stampRewardValue ?? 0) < 0) {
      return { error: "Nilai reward stempel tidak valid." };
    }
  }
  if (staticQrisPayload) {
    try {
      staticQrisPayload = normalizeStaticQrisPayload(staticQrisPayload);
      buildDynamicQris(staticQrisPayload, 1000);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Payload QRIS tidak valid.",
      };
    }
  }
  try {
    if (input.businessType) {
      await updateTenantBusinessType(user.tenantId, input.businessType);
    }
    await updateTenantSetting(user.tenantId, {
      taxPercent: input.taxPercent,
      pointsPerAmount: input.pointsPerAmount,
      receiptFooter: input.receiptFooter,
      staticQrisPayload,
      accountingMode: input.accountingMode,
      stampProgramEnabled: input.stampProgramEnabled ?? false,
      stampTarget: input.stampTarget ?? 10,
      stampRewardName: input.stampRewardName?.trim() || null,
      stampRewardValue: input.stampRewardValue ?? 0,
    });
    if (input.channelMarkups) {
      for (const [orderType, markupPercent] of Object.entries(input.channelMarkups)) {
        if (!Number.isFinite(markupPercent)) continue;
        await setChannelPricingRule(user.tenantId, orderType as OrderType, markupPercent as number);
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan pengaturan." };
  }
  revalidatePath("/pengaturan/bisnis");
  revalidatePath("/pilih-aplikasi");
  revalidatePath("/kasir");
  return { success: true };
}

export async function exportTenantBackupAction(): Promise<{ error?: string; success?: boolean; data?: any }> {
  const user = await requireRole(["OWNER"]);
  
  try {
    const { prisma } = await import("@/lib/prisma");

    const [tenant, setting, outlets, categories, products, sales, suppliers, members] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: user.tenantId } }),
      prisma.tenantSetting.findUnique({ where: { tenantId: user.tenantId } }),
      prisma.outlet.findMany({ where: { tenantId: user.tenantId } }),
      prisma.category.findMany({ where: { tenantId: user.tenantId } }),
      prisma.product.findMany({ where: { tenantId: user.tenantId }, include: { stocks: true, reorderPoints: true } }),
      prisma.sale.findMany({ where: { tenantId: user.tenantId }, include: { items: true, saleReturns: true } }),
      prisma.supplier.findMany({ where: { tenantId: user.tenantId } }),
      prisma.member.findMany({ where: { tenantId: user.tenantId } }),
    ]);

    return {
      success: true,
      data: {
        exportVersion: "1.0.0",
        timestamp: new Date().toISOString(),
        tenant,
        setting,
        outlets,
        categories,
        products,
        sales,
        suppliers,
        members,
      },
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengekspor data backup." };
  }
}
