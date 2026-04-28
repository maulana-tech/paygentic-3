import { NextResponse } from 'next/server';
import { getListingById, getAgentById, purchases, addActivityLog, Purchase, createServiceAccess } from '@/data/store';

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY;

export async function POST(req: Request) {
  try {
    const { amount, description, listingId, sellerAgentId, buyerAgentId, buyerUserId: _buyerUserId } = await req.json();
    const buyerUserId = _buyerUserId || buyerAgentId;

    const listing = getListingById(listingId);
    const seller = listing ? getAgentById(listing.agentId || listing.userId) : null;

    if (!listing || !seller || !buyerUserId) {
      return NextResponse.json({ error: 'Invalid listing or user ID' }, { status: 400 });
    }

    const purchaseId = `purchase_${crypto.randomUUID().slice(0, 8)}`;
    const purchase: Purchase = {
      id: purchaseId,
      listingId,
      sellerAgentId: listing.agentId || listing.userId,
      buyerUserId,
      transactionId: undefined,
      status: 'PENDING',
      amount,
      autoPurchased: false,
      createdAt: new Date().toISOString()
    };
    purchases.push(purchase);

    if (!LOCUS_API_KEY) {
      purchase.status = 'CONFIRMED';
      purchase.transactionId = `tx_demo_${crypto.randomUUID().slice(0, 8)}`;

      const serviceAccess = createServiceAccess({
        purchaseId,
        listingId,
        buyerUserId,
        sellerAgentId: listing.agentId || listing.userId,
        status: 'ACTIVE'
      });
      
      addActivityLog(buyerUserId, 'PURCHASE', `Purchased ${listing.title} from ${seller.name} for $${amount}`, {
        amount,
        seller: seller.name,
        auto: 'false',
        accessToken: serviceAccess.accessToken
      });

      addActivityLog(listing.agentId || listing.userId, 'SALE', `Sold ${listing.title} for $${amount}`, {
        amount,
        buyer: buyerUserId
      });

      return NextResponse.json({ 
        success: true,
        sessionId: `sess_${crypto.randomUUID().slice(0, 8)}`,
        purchaseId,
        checkoutUrl: `https://beta-checkout.paywithlocus.com/demo`,
        demo: true,
        status: 'CONFIRMED',
        accessToken: serviceAccess.accessToken
      });
    }

    const createRes = await fetch(`${LOCUS_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        description,
        metadata: { listingId, sellerAgentId: listing.agentId, buyerUserId, purchaseId }
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: createRes.status });
    }

    const session = await createRes.json();
    const sessionId = session.data?.id;
    const checkoutUrl = session.data?.checkoutUrl;

    const preflightRes = await fetch(`${LOCUS_API_BASE}/checkout/agent/preflight/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
    });
    const preflight = await preflightRes.json();

    if (!preflight.canPay) {
      return NextResponse.json({ 
        sessionId,
        checkoutUrl: checkoutUrl || `https://beta-checkout.paywithlocus.com/${sessionId}`,
        manual: true,
        blockers: preflight.blockers
      });
    }

    const payRes = await fetch(`${LOCUS_API_BASE}/checkout/agent/pay/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payerEmail: buyerUserId })
    });

    if (!payRes.ok) {
      purchase.status = 'FAILED';
      const err = await payRes.json();
      addActivityLog(buyerUserId, 'ERROR', `Payment failed for ${listing.title}`, { error: err.message });
      return NextResponse.json({ error: err.message || 'Payment failed' }, { status: payRes.status });
    }

    const payment = await payRes.json();
    purchase.transactionId = payment?.data?.transactionId;
    purchase.status = payment?.data?.status || 'PENDING';

    addActivityLog(buyerUserId, 'PURCHASE', `Purchased ${listing.title} from ${seller.name} for $${amount}`, {
      amount,
      seller: seller.name,
      auto: 'false'
    });

    return NextResponse.json({ 
      sessionId,
      purchaseId,
      transactionId: purchase.transactionId,
      status: purchase.status,
      checkoutUrl: checkoutUrl || `https://beta-checkout.paywithlocus.com/${sessionId}`
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get('transactionId');
  const sessionId = searchParams.get('sessionId');

  if (!LOCUS_API_KEY) {
    return NextResponse.json({ status: 'CONFIRMED', demo: true });
  }

  try {
    if (transactionId) {
      const res = await fetch(`${LOCUS_API_BASE}/checkout/agent/payments/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
      });
      return NextResponse.json(await res.json());
    }

    if (sessionId) {
      const res = await fetch(`${LOCUS_API_BASE}/checkout/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
      });
      return NextResponse.json(await res.json());
    }

    return NextResponse.json({ error: 'Missing transactionId or sessionId' }, { status: 400 });
  } catch (error) {
    console.error('Poll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}