import crypto from 'crypto';

const SUMOPOD_API_KEY = process.env.SUMOPOD_API_KEY!;
const SUMOPOD_API_SECRET = process.env.SUMOPOD_API_SECRET!;
const SUMOPOD_WEBHOOK_SECRET = process.env.SUMOPOD_WEBHOOK_SECRET!;
const SUMOPOD_BASE_URL = process.env.SUMOPOD_BASE_URL!;

export interface CreatePaymentLink {
  order_id: string;
  amount: number;
  currency: string;
  customer_email: string;
  customer_name: string;
  description: string;
  success_return_url: string;
  cancel_return_url: string;
  expiration_time?: number;
}

export interface SumopodPaymentResponse {
  order_id: string;
  payment_link_url: string;
  payment_link_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  expired_at: string;
}

export interface SumopodWebhookPayload {
  order_id: string;
  payment_link_id: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string;
  paid_at?: string;
  payer_email?: string;
}

/**
 * Buat payment link di SumoPod
 * Customer akan di-redirect ke payment_link_url untuk checkout
 */
export async function createPaymentLink(
  payload: CreatePaymentLink
): Promise<SumopodPaymentResponse> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(SUMOPOD_API_SECRET, timestamp.toString());

  const response = await fetch(`${SUMOPOD_BASE_URL}/v1/payment-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': SUMOPOD_API_KEY,
      'X-Timestamp': timestamp.toString(),
      'X-Signature': signature,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`SumoPod API error: ${error.message}`);
  }

  return response.json();
}

/**
 * Verify webhook signature dari SumoPod
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  const message = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', SUMOPOD_WEBHOOK_SECRET)
    .update(message)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Get payment status dari SumoPod
 */
export async function getPaymentStatus(
  paymentLinkId: string
): Promise<SumopodPaymentResponse> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(SUMOPOD_API_SECRET, timestamp.toString());

  const response = await fetch(
    `${SUMOPOD_BASE_URL}/v1/payment-links/${paymentLinkId}`,
    {
      headers: {
        'X-Api-Key': SUMOPOD_API_KEY,
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch payment status from SumoPod');
  }

  return response.json();
}

/**
 * Generate HMAC-SHA256 signature untuk SumoPod API
 */
function generateSignature(secret: string, timestamp: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(timestamp)
    .digest('hex');
}
