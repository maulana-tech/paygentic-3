import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook handler for Locus payment events
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('X-Signature-256');
    const event = req.headers.get('X-Webhook-Event');
    const sessionId = req.headers.get('X-Session-Id');
    const body = await req.text();

    // Verify webhook signature (optional but recommended)
    const webhookSecret = process.env.LOCUS_WEBHOOK_SECRET;
    if (signature && webhookSecret) {
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(body);
    const eventData = data.data || data;

    console.log('Locus webhook:', event, sessionId);

    if (event === 'checkout.session.paid') {
      // Payment confirmed - update order status
      const { sessionId, amount, paymentTxHash, payerAddress, metadata } = eventData;
      
      console.log('Payment confirmed:', {
        sessionId,
        amount,
        paymentTxHash,
        payerAddress,
        metadata
      });

      // TODO: Update order in database
      // 1. Find order by locusSessionId
      // 2. Update status to PAID
      // 3. Mark paymentTxHash, payerAddress, paidAt
      // 4. Trigger service fulfillment

      return NextResponse.json({ success: true });
    }

    if (event === 'checkout.session.expired') {
      // Session expired - update order status
      const { sessionId } = eventData;
      
      console.log('Session expired:', sessionId);

      // TODO: Update order in database
      // 1. Find order by locusSessionId
      // 2. Update status to EXPIRED

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, event: event });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}