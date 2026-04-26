import { NextResponse } from 'next/server';
import { getListingById, getAgentById, purchases, Purchase, PurchaseStatus } from '@/data/store';

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY;

export async function POST(req: Request) {
  try {
    const { listingId, buyerAgentId } = await req.json();

    const listing = getListingById(listingId);
    const buyer = getAgentById(buyerAgentId);
    const seller = listing ? getAgentById(listing.agentId) : null;

    if (!listing || !buyer || !seller) {
      return NextResponse.json({ error: 'Invalid listing or agent ID' }, { status: 400 });
    }

    // Record autonomous purchase
    const purchaseId = `purchase_${crypto.randomUUID().slice(0, 8)}`;
    const purchase: Purchase = {
      id: purchaseId,
      listingId,
      sellerAgentId: listing.agentId,
      buyerAgentId,
      transactionId: undefined,
      status: 'PENDING',
      amount: listing.priceUSDC,
      createdAt: new Date().toISOString()
    };
    purchases.push(purchase);

    // Demo mode - autonomous purchase succeeds immediately
    if (!LOCUS_API_KEY) {
      const confirmedPurchase = {
        ...purchase,
        status: 'CONFIRMED' as PurchaseStatus,
        transactionId: `tx_demo_${crypto.randomUUID().slice(0, 8)}`
      };
      purchases[purchases.length - 1] = confirmedPurchase;
      
      return NextResponse.json({ 
        success: true,
        purchaseId,
        transactionId: purchase.transactionId,
        status: 'CONFIRMED',
        autonomous: true,
        buyerAgent: buyer.name,
        sellerAgent: seller.name,
        listingTitle: listing.title,
        amount: listing.priceUSDC,
        message: `Agent ${buyer.name} autonomously purchased ${listing.title} from ${seller.name}`
      });
    }

    // Real Locus flow
    const createRes = await fetch(`${LOCUS_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: listing.priceUSDC,
        description: listing.title,
        metadata: { listingId, sellerAgentId: listing.agentId, buyerAgentId, purchaseId, autonomous: true }
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: createRes.status });
    }

    const session = await createRes.json();
    const sessionId = session.data?.id;

    // Preflight check
    const preflightRes = await fetch(`${LOCUS_API_BASE}/checkout/agent/preflight/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
    });
    const preflight = await preflightRes.json();

    if (!preflight.canPay) {
      purchase.status = 'FAILED';
      return NextResponse.json({ 
        error: 'Cannot pay autonomously',
        blockers: preflight.blockers,
        sessionId,
        purchaseId
      }, { status: 400 });
    }

    // Autonomous agent payment
    const payRes = await fetch(`${LOCUS_API_BASE}/checkout/agent/pay/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payerEmail: buyer.walletAddress })
    });

    if (!payRes.ok) {
      purchase.status = 'FAILED';
      const err = await payRes.json();
      return NextResponse.json({ error: err.message || 'Payment failed' }, { status: payRes.status });
    }

    const payment = await payRes.json();
    purchase.transactionId = payment?.data?.transactionId;
    purchase.status = payment?.data?.status || 'PENDING';

    return NextResponse.json({
      success: true,
      purchaseId,
      transactionId: purchase.transactionId,
      status: purchase.status,
      autonomous: true,
      buyerAgent: buyer.name,
      sellerAgent: seller.name,
      listingTitle: listing.title,
      amount: listing.priceUSDC,
      message: `Agent ${buyer.name} autonomously purchased ${listing.title} from ${seller.name}`
    });

  } catch (error) {
    console.error('Autonomous purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}