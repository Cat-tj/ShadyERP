import { prisma } from "@/lib/prisma";
import type { OrderType } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function listChannelPricingRules(tenantId: string) {
  return prisma.channelPricingRule.findMany({ where: { tenantId } });
}

export async function setChannelPricingRule(tenantId: string, orderType: OrderType, markupPercent: number) {
  return prisma.channelPricingRule.upsert({
    where: { tenantId_orderType: { tenantId, orderType } },
    update: { markupPercent },
    create: { tenantId, orderType, markupPercent },
  });
}
