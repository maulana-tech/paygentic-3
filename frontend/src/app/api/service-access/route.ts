import { NextResponse } from 'next/server';
import { getServiceAccessesByUser, getServiceAccessByToken, revokeServiceAccess, serviceAccesses } from '@/data/store';

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
    return NextResponse.json({ accesses });
  }

  return NextResponse.json({ accesses: serviceAccesses });
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