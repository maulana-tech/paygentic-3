import { NextResponse } from 'next/server';
import { getAgentById, purchases } from '@/data/store';

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY;

export async function POST(req: Request) {
  try {
    const { amount, description, listingId, sellerAgentId, buyerAgentId } = await req.json();

    const seller = getAgentById(sellerAgentId);
    const buyer = getAgentById(buyerAgentId);

    if (!seller || !buyer) {
      return NextResponse.json({ error: 'Invalid agent IDs' }, { status: 400 });
    }

    // Record purchase attempt
    const purchaseId = `purchase_${crypto.randomUUID().slice(0, 8)}`;
    const purchase = {
      id: purchaseId,
      listingId,
      sellerAgentId,
      buyerAgentId,
      transactionId: undefined,
      status: 'PENDING' as const,
      amount,
      createdAt: new Date().toISOString()
    };
    purchases.push(purchase);

    if (!LOCUS_API_KEY) {
      // Demo mode - return mock session
      const sessionId = `sess_${crypto.randomUUID().slice(0, 8)}`;
      return NextResponse.json({ 
        sessionId, 
        purchaseId,
        checkoutUrl: `https://beta-checkout.paywithlocus.com/${sessionId}`,
        demo: true 
      });
    }

    // Step 1: Create session with seller as recipient
    const createRes = await fetch(`${LOCUS_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        description: description,
        successUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/marketplace/success?session=$SESSION_ID$`,
        cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/marketplace/listing/${listingId}`,
        metadata: { listingId, sellerAgentId, buyerAgentId, purchaseId }
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error('Locus create session error:', err);
      return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: createRes.status });
    }

    const session = await createRes.json();
    const sessionId = session.data?.id;
    const checkoutUrl = session.data?.checkoutUrl;

    // Step 2: Preflight check for agent payment
    const preflightRes = await fetch(`${LOCUS_API_BASE}/checkout/agent/preflight/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
    });

    const preflight = await preflightRes.json();

    // If cannot pay via agent, return session for manual payment
    if (!preflight.canPay) {
      return NextResponse.json({ 
        sessionId,
        purchaseId,
        checkoutUrl: checkoutUrl || `https://beta-checkout.paywithlocus.com/${sessionId}`,
        manual: true,
        blockers: preflight.blockers
      });
    }

    // Step 3: Agent pays the session
    const payRes = await fetch(`${LOCUS_API_BASE}/checkout/agent/pay/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payerEmail: buyer.walletAddress })
    });

    if (!payRes.ok) {
      const err = await payRes.json();
      return NextResponse.json({ error: err.message || 'Payment failed' }, { status: payRes.status });
    }

    const payment = await payRes.json();
    const transactionId = payment?.data?.transactionId;
    
    // Update purchase with transaction ID
    purchase.transactionId = transactionId;
    
    // Return payment for polling
    return NextResponse.json({ 
      sessionId,
      purchaseId,
      transactionId,
      status: payment?.data?.status,
      checkoutUrl: checkoutUrl || `https://beta-checkout.paywithlocus.com/${sessionId}`
    });

  } catch (error) {
    console.error('Locus checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Poll payment status
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get('transactionId');
  const sessionId = searchParams.get('sessionId');

  if (!LOCUS_API_KEY) {
    // Demo mode - confirm immediately
    return NextResponse.json({ status: 'CONFIRMED', demo: true });
  }

  try {
    if (transactionId) {
      const res = await fetch(`${LOCUS_API_BASE}/checkout/agent/payments/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
      });
      const data = await res.json();
      
      // Update purchase status based on payment status
      const purchase = purchases.find(p => p.transactionId === transactionId);
      if (purchase && data.status) {
        purchase.status = data.status;
      }
      
      return NextResponse.json(data);
    }

    if (sessionId) {
      const res = await fetch(`${LOCUS_API_BASE}/checkout/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Missing transactionId or sessionId' }, { status: 400 });
  } catch (error) {
    console.error('Locus poll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}