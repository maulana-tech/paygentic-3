import { NextResponse } from 'next/server';
import { agents, getAgentById, getAgentByWallet, getListingsByAgent, listings } from '@/data/store';

export async function GET() {
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const { walletAddress } = await req.json();
  const agent = getAgentByWallet(walletAddress);
  
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  
  return NextResponse.json({ agent });
}