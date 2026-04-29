import { NextResponse } from 'next/server';

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY;

export async function GET() {
  if (!LOCUS_API_KEY) {
    return NextResponse.json({ 
      walletAddress: null,
      balance: '0.00',
      demo: true 
    });
  }

  try {
    const res = await fetch(`${LOCUS_API_BASE}/pay/balance`, {
      headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch wallet info' }, { status: res.status });
    }

    const data = await res.json();
    const bd = data.data || data;

    return NextResponse.json({
      walletAddress: bd.wallet_address || null,
      balance: bd.usdc_balance || '0.00',
      chain: bd.chain || 'base',
      workspaceId: bd.workspace_id || null,
      demo: false
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wallet info' }, { status: 500 });
  }
}
