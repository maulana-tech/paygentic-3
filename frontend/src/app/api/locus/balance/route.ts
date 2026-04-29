import { NextResponse } from 'next/server';

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY;

export async function GET() {
  if (!LOCUS_API_KEY) {
    return NextResponse.json({ 
      balance: '0.00', 
      token: 'USDC',
      walletAddress: null,
      demo: true 
    });
  }

  try {
    const res = await fetch(`${LOCUS_API_BASE}/pay/balance`, {
      headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: res.status });
    }

    const data = await res.json();
    const balanceData = data.data || data;

    return NextResponse.json({
      balance: balanceData.balance || balanceData.amount || '0.00',
      token: balanceData.token || 'USDC',
      walletAddress: balanceData.walletAddress || balanceData.address || null,
      demo: false
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}
