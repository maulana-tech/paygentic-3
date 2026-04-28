import { NextResponse } from 'next/server';
import { getListingById, createNegotiation, getNegotiationsByUser, updateNegotiation, getAgentById, addActivityLog, getNegotiationsForListing, negotiations } from '@/data/store';

export async function POST(req: Request) {
  try {
    const { listingId, buyerUserId, offeredPrice, buyerMessage } = await req.json();
    
    const listing = getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    const price = parseFloat(offeredPrice);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid offer price' }, { status: 400 });
    }
    
    const negotiation = createNegotiation({
      listingId,
      buyerUserId,
      sellerAgentId: listing.agentId || listing.userId,
      originalPrice: listing.priceUSDC,
      offeredPrice,
      status: 'PENDING',
      buyerMessage
    });
    
    addActivityLog(buyerUserId, 'OFFER_MADE', `Made offer of $${offeredPrice} for "${listing.title}"`, {
      listing: listing.title,
      offeredPrice,
      originalPrice: listing.priceUSDC
    });
    
    return NextResponse.json({ negotiation });
  } catch (error) {
    console.error('Negotiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const listingId = searchParams.get('listingId');
  
  if (userId) {
    const userNegotiations = getNegotiationsByUser(userId);
    return NextResponse.json({ negotiations: userNegotiations });
  }
  
  if (listingId) {
    const listingNegotiations = getNegotiationsForListing(listingId);
    return NextResponse.json({ negotiations: listingNegotiations });
  }
  
  return NextResponse.json({ error: 'Missing userId or listingId' }, { status: 400 });
}