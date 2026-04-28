import { NextResponse } from 'next/server';
import { getListingById, createSubscription, getSubscriptionsByUser, getActiveSubscriptionsByUser, updateSubscription, addActivityLog } from '@/data/store';

export async function POST(req: Request) {
  try {
    const { listingId, buyerUserId, planType } = await req.json();
    
    const listing = getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    const originalPrice = parseFloat(listing.priceUSDC);
    let amount: string;
    
    if (planType === 'monthly') {
      amount = (originalPrice * 0.6).toFixed(2); // 40% discount
    } else if (planType === 'annual') {
      amount = (originalPrice * 6).toFixed(2); // 50% discount
    } else {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }
    
    const subscription = createSubscription({
      listingId,
      buyerUserId,
      sellerAgentId: listing.agentId || listing.userId,
      planType: planType as 'monthly' | 'annual',
      amount,
      originalPrice: listing.priceUSDC,
      status: 'ACTIVE'
    });
    
    addActivityLog(buyerUserId, 'SUBSCRIPTION_CREATED', `Subscribed to "${listing.title}" (${planType})`, {
      plan: planType,
      amount
    });
    
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const activeOnly = searchParams.get('activeOnly') === 'true';
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  
  const userSubscriptions = activeOnly 
    ? getActiveSubscriptionsByUser(userId) 
    : getSubscriptionsByUser(userId);
  
  return NextResponse.json({ subscriptions: userSubscriptions });
}

export async function PATCH(req: Request) {
  try {
    const { subscriptionId, status } = await req.json();
    
    const updated = updateSubscription(subscriptionId, { status: status as 'ACTIVE' | 'PAUSED' | 'CANCELLED' });
    if (!updated) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    
    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}