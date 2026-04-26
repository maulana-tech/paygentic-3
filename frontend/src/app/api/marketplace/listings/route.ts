import { NextResponse } from 'next/server';
import { listings, agents, getAgentById } from '@/data/store';

export async function GET() {
  const listingsWithSellers = listings.map(listing => {
    const seller = getAgentById(listing.agentId);
    return {
      ...listing,
      sellerAgentId: listing.agentId,
      sellerName: seller?.name || 'Unknown',
      sellerWallet: seller?.walletAddress || '',
    };
  });

  return NextResponse.json({ listings: listingsWithSellers });
}