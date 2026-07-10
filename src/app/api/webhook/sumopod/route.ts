import { NextRequest, NextResponse } from 'next/server';
import * as billingService from '@/server/services/billing-service';
import * as sumopodService from '@/server/services/sumopod-service';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 400 }
      );
    }

    const body = await request.text();

    const isValid = sumopodService.verifyWebhookSignature(
      body,
      signature,
      timestamp
    );

    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    console.log(`🔔 Webhook received: ${payload.order_id} - ${payload.status}`);

    if (payload.status === 'success') {
      await billingService.handlePaymentSuccess(payload);
    } else if (payload.status === 'failed' || payload.status === 'expired') {
      console.log(`Payment failed for: ${payload.order_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
