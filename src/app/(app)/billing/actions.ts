'use server';

import { requireSession } from '@/server/require-session';
import * as billingService from '@/server/services/billing-service';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function upgradeSubscription(
  newPlan: string,
  billingCycle: 'MONTHLY' | 'YEARLY'
) {
  const user = await requireSession();
  const tenantId = user.tenantId;

  if (!['BASIC', 'PRO'].includes(newPlan)) {
    throw new Error('Invalid plan');
  }

  const result = await billingService.upgradePlan(
    tenantId,
    newPlan as 'BASIC' | 'PRO',
    billingCycle,
    process.env.NEXT_PUBLIC_BASE_URL!
  );

  return result;
}

export async function getSubscription() {
  const user = await requireSession();
  const tenantId = user.tenantId;

  // Auto-create subscription if doesn't exist
  let subscription: any = await prisma.subscription.findUnique({
    where: { tenantId },
    include: {
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      paymentHistory: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!subscription) {
    subscription = await billingService.createSubscription(tenantId);
    // Re-fetch with relations
    subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        paymentHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  return subscription;
}

export async function cancelSubscription(reason?: string) {
  const user = await requireSession();
  const tenantId = user.tenantId;

  const subscription = await prisma.subscription.update({
    where: { tenantId },
    data: {
      status: 'CANCELLED',
      autoRenew: false,
      cancelledAt: new Date(),
      cancelledReason: reason,
    },
  });

  revalidatePath('/billing');
  return { success: true, subscription };
}
