import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { purchases, getListingById, createServiceAccess, addActivityLog, getAgentById } from '@/data/store';

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
      const { sessionId, amount, paymentTxHash, payerAddress, metadata } = eventData;
      
      console.log('Payment confirmed:', {
        sessionId,
        amount,
        paymentTxHash,
        payerAddress,
        metadata
      });

      // Find purchase by transaction ID or session ID
      const purchase = purchases.find(p => 
        p.transactionId === sessionId || 
        (metadata?.purchaseId && p.id === metadata.purchaseId)
      );

      if (purchase) {
        // Update purchase status
        purchase.status = 'CONFIRMED';
        purchase.transactionId = paymentTxHash || purchase.transactionId;

        const listing = getListingById(purchase.listingId);
        const seller = listing ? getAgentById(listing.agentId || listing.userId) : null;

        // Create service access for buyer
        const serviceAccess = createServiceAccess({
          purchaseId: purchase.id,
          listingId: purchase.listingId,
          buyerUserId: purchase.buyerUserId,
          sellerAgentId: purchase.sellerAgentId,
          status: 'ACTIVE'
        });

        // Log activity
        addActivityLog(purchase.buyerUserId, 'PURCHASE', 
          `Purchased ${listing?.title || 'service'} from ${seller?.name || 'agent'}`, {
            amount: purchase.amount,
            serviceAccess: serviceAccess.accessToken,
            seller: seller?.name || 'unknown'
          }
        );

        // Notify seller (log for now)
        if (seller) {
          addActivityLog(seller.id, 'SALE', 
            `New sale: ${listing?.title || 'service'} to buyer`, {
              amount: purchase.amount,
              buyer: payerAddress?.slice(0, 10) + '...'
            }
          );
        }

        console.log('Service access created:', serviceAccess.accessToken);
      }

      return NextResponse.json({ 
        success: true,
        purchaseId: purchase?.id || null,
        serviceCreated: !!purchase
      });
    }

    if (event === 'checkout.session.expired') {
      const { sessionId } = eventData;
      
      console.log('Session expired:', sessionId);

      // Find and update purchase
      const purchase = purchases.find(p => p.transactionId === sessionId);
      if (purchase) {
        purchase.status = 'FAILED';
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, event: event });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}