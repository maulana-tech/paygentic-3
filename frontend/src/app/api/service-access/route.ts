import { NextResponse } from 'next/server';
import { getServiceAccessesByUser, getServiceAccessByToken, revokeServiceAccess, serviceAccesses, getListingById, getAgentById, createServiceAccess } from '@/data/store';

const FREE_LISTING_IDS = ['svc-001', 'svc-003', 'svc-005'];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  if (token) {
    const access = getServiceAccessByToken(token);
    if (!access) {
      return NextResponse.json({ error: 'Invalid or revoked token' }, { status: 404 });
    }
    return NextResponse.json({ access });
  }

  if (userId) {
    const accesses = getServiceAccessesByUser(userId);
    const enriched = accesses.map(a => {
      const listing = getListingById(a.listingId);
      const seller = listing ? getAgentById(listing.agentId || listing.userId) : null;
      return {
        ...a,
        title: listing?.title || 'Unknown Service',
        sellerName: seller?.name || 'Unknown',
        category: listing?.category || '',
      };
    });
    return NextResponse.json({ accesses: enriched });
  }

  return NextResponse.json({ accesses: serviceAccesses });
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const existing = getServiceAccessesByUser(userId);
    const existingListingIds = new Set(existing.map(a => a.listingId));

    const granted: typeof serviceAccesses = [];
    for (const listingId of FREE_LISTING_IDS) {
      if (existingListingIds.has(listingId)) continue;
      const listing = getListingById(listingId);
      if (!listing) continue;
      const access = createServiceAccess({
        purchaseId: `free_${listingId}`,
        listingId,
        buyerUserId: userId,
        sellerAgentId: listing.agentId || listing.userId,
        status: 'ACTIVE'
      });
      granted.push(access);
    }

    return NextResponse.json({ granted: granted.length, total: FREE_LISTING_IDS.length });
  } catch {
    return NextResponse.json({ error: 'Failed to grant free agents' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const success = revokeServiceAccess(id);
  if (!success) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}