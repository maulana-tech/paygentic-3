import { NextResponse } from 'next/server';

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY;

export async function POST(req: Request) {
  try {
    const { amount, description, listingId, buyerAgent } = await req.json();

    if (!LOCUS_API_KEY) {
      // Demo mode - return mock session
      const sessionId = `sess_${crypto.randomUUID().slice(0, 8)}`;
      return NextResponse.json({ 
        sessionId, 
        checkoutUrl: `https://checkout.paywithlocus.com/${sessionId}`,
        demo: true 
      });
    }

    // Step 1: Create session (merchant side - would normally be done by merchant)
    // For demo, we create a pending session
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
        metadata: { listingId, buyerAgent }
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error('Locus create session error:', err);
      return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: createRes.status });
    }

    const session = await createRes.json();
    console.log('Locus session response:', session);
    const sessionId = session.data?.id;
    const checkoutUrl = session.data?.checkoutUrl;

    console.log('Session ID:', sessionId);

    // Step 2: Preflight check for agent payment
    const preflightRes = await fetch(`${LOCUS_API_BASE}/checkout/agent/preflight/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
    });

    const preflight = await preflightRes.json();

    // If cannot pay via agent, return session for manual payment
    if (!preflight.canPay) {
      return NextResponse.json({ 
        sessionId,
        checkoutUrl: `https://checkout.paywithlocus.com/${sessionId}`,
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
      body: JSON.stringify({ payerEmail: buyerAgent })
    });

    if (!payRes.ok) {
      const err = await payRes.json();
      return NextResponse.json({ error: err.message || 'Payment failed' }, { status: payRes.status });
    }

    const payment = await payRes.json();
    
    // Return payment for polling
    return NextResponse.json({ 
      sessionId,
      transactionId: payment?.data?.transactionId,
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
    return NextResponse.json({ status: 'CONFIRMED', demo: true });
  }

  try {
    if (transactionId) {
      const res = await fetch(`${LOCUS_API_BASE}/checkout/agent/payments/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
      });
      const data = await res.json();
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