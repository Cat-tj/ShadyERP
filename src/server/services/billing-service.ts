import { prisma } from '@/lib/prisma';
import * as sumopodService from './sumopod-service';
import { Plan } from '@prisma/client';

const PLAN_PRICES: Record<Plan, { monthly: number; yearly: number }> = {
  FREE: { monthly: 0, yearly: 0 },
  BASIC: { monthly: 99000, yearly: 990000 },
  PRO: { monthly: 299000, yearly: 2990000 },
};

export async function createSubscription(tenantId: string) {
  const now = new Date();
  const trialStartDate = now;
  const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  return prisma.subscription.create({
    data: {
      tenantId,
      plan: 'FREE',
      status: 'ACTIVE',
      isOnTrial: true,
      trialStartDate,
      trialEndDate,
      currentPeriodStart: trialStartDate,
      currentPeriodEnd: trialEndDate,
      billingCycle: 'MONTHLY',
    },
  });
}

export async function upgradePlan(
  tenantId: string,
  newPlan: Plan,
  billingCycle: 'MONTHLY' | 'YEARLY',
  baseUrl: string
) {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
    include: { tenant: true },
  });

  if (!subscription) throw new Error('Subscription not found');

  const cycleKey = billingCycle.toLowerCase() as 'monthly' | 'yearly';
  const amount = PLAN_PRICES[newPlan][cycleKey];

  if (amount === 0) {
    throw new Error('Cannot upgrade to FREE plan');
  }

  const invoiceNumber = generateInvoiceNumber();
  const now = new Date();
  const periodDays = billingCycle === 'MONTHLY' ? 30 : 365;
  const toDate = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  const invoice = await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      invoiceNumber,
      amount,
      total: amount,
      status: 'DRAFT',
      description: `ShadyERP ${newPlan} - ${billingCycle.toLowerCase()} subscription`,
      dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      fromDate: now,
      toDate,
      items: [
        {
          description: `ShadyERP ${newPlan} - ${billingCycle}`,
          quantity: 1,
          unitPrice: amount,
          total: amount,
        },
      ],
    },
  });

  const paymentLink = await sumopodService.createPaymentLink({
    order_id: invoiceNumber,
    amount,
    currency: 'IDR',
    customer_email: 'admin@example.com',
    customer_name: subscription.tenant.name,
    description: invoice.description,
    success_return_url: `${baseUrl}/billing/success?invoice=${invoiceNumber}`,
    cancel_return_url: `${baseUrl}/billing/cancel?invoice=${invoiceNumber}`,
    expiration_time: 86400,
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'ISSUED',
      sumopodPaymentId: paymentLink.payment_link_id,
    },
  });

  return {
    invoiceId: invoice.id,
    invoiceNumber,
    paymentUrl: paymentLink.payment_link_url,
    amount,
  };
}

export async function handlePaymentSuccess(
  payload: sumopodService.SumopodWebhookPayload
) {
  const { order_id, payment_link_id, amount, status, paid_at } = payload;

  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: order_id },
    include: { subscription: true },
  });

  if (!invoice) {
    console.error(`Invoice not found: ${order_id}`);
    return;
  }

  if (status !== 'success') {
    await handlePaymentFailed(invoice.id, payload);
    return;
  }

  await prisma.paymentHistory.create({
    data: {
      subscriptionId: invoice.subscriptionId,
      sumopodPaymentId: payment_link_id,
      invoiceId: invoice.id,
      amount,
      currency: 'IDR',
      paymentMethod: payload.payment_method || 'UNKNOWN',
      status: 'SUCCESS',
      processedAt: paid_at ? new Date(paid_at) : new Date(),
      metadata: payload as any,
    },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'PAID',
      paidDate: new Date(),
    },
  });

  const newPlan = extractPlanFromDescription(invoice.description) as Plan;
  const newPeriodEnd = invoice.toDate;

  await prisma.subscription.update({
    where: { id: invoice.subscriptionId },
    data: {
      plan: newPlan,
      status: 'ACTIVE',
      isOnTrial: false,
      trialEndDate: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: newPeriodEnd,
      nextBillingDate: newPeriodEnd,
      lastPaymentId: payment_link_id,
      lastPaymentAmount: amount,
      lastPaymentDate: new Date(),
      autoRenew: true,
    },
  });

  console.log(`✅ Payment success: ${order_id}`);
}

async function handlePaymentFailed(
  invoiceId: string,
  payload: sumopodService.SumopodWebhookPayload
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { subscription: true },
  });

  if (!invoice) return;

  await prisma.paymentHistory.create({
    data: {
      subscriptionId: invoice.subscriptionId,
      sumopodPaymentId: payload.payment_link_id,
      invoiceId,
      amount: payload.amount,
      currency: 'IDR',
      status: 'FAILED',
      failureReason:
        payload.status === 'expired' ? 'Payment link expired' : 'Payment failed',
      metadata: payload as any,
    },
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'OVERDUE' },
  });

  console.log(`❌ Payment failed: ${payload.order_id}`);
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `INV-${year}-${month}-${random}`;
}

function extractPlanFromDescription(desc: string): 'BASIC' | 'PRO' {
  if (desc.toUpperCase().includes('PRO')) return 'PRO';
  return 'BASIC';
}

export async function checkAndExpireTrials() {
  const now = new Date();

  await prisma.subscription.updateMany({
    where: {
      isOnTrial: true,
      trialEndDate: { lt: now },
    },
    data: {
      status: 'EXPIRED',
      isOnTrial: false,
    },
  });
}

/**
 * List subscription history (stub for existing code)
 */
export async function listSubscriptionHistory(tenantId: string) {
  return prisma.paymentHistory.findMany({
    where: {
      subscription: {
        tenantId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Request upgrade (stub for existing code)
 */
export async function requestUpgrade(
  tenantId: string,
  plan: Plan,
  note?: string
) {
  // Placeholder - actual implementation uses upgradePlan above
  return { success: true, message: 'Use upgradePlan instead' };
}

/**
 * Get usage for tenant (stub)
 */
export async function getUsageForTenant(tenantId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
  });

  return {
    plan: subscription?.plan || 'FREE',
    outlets: 0,
    employees: 0,
    products: 0,
  };
}

/**
 * Get pending request (stub)
 */
export async function getPendingRequestForTenant(tenantId: string) {
  return null;
}

/**
 * Assert can add outlet (stub - checks plan limits)
 */
export async function assertCanAddOutlet(tenantId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
  });

  // For now, allow all
  return true;
}

/**
 * Assert can add product (stub - checks plan limits)
 */
export async function assertCanAddProduct(tenantId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
  });

  // For now, allow all
  return true;
}
