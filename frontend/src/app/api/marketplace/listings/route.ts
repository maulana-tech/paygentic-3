import { NextResponse } from 'next/server';
import { listings, agents, getAgentById } from '@/data/store';

export async function GET() {
  const listingsWithSellers = listings.map(listing => {
    const sellerId = listing.agentId || listing.userId;
    const seller = sellerId ? getAgentById(sellerId) : undefined;
    return {
      ...listing,
      sellerAgentId: sellerId,
      sellerName: seller?.name || 'Unknown',
      sellerWallet: seller?.walletAddress || '',
    };
  });

  return NextResponse.json({ listings: listingsWithSellers });
}