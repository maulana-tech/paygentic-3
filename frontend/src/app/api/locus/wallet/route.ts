import { NextResponse } from 'next/server';

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY;

export async function GET() {
  if (!LOCUS_API_KEY) {
    return NextResponse.json({ 
      walletAddress: null,
      email: null,
      workspaceId: null,
      demo: true 
    });
  }

  try {
    const [balanceRes, txRes] = await Promise.all([
      fetch(`${LOCUS_API_BASE}/pay/balance`, {
        headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
      }),
      fetch(`${LOCUS_API_BASE}/pay/transactions?limit=1`, {
        headers: { 'Authorization': `Bearer ${LOCUS_API_KEY}` }
      })
    ]);

    const balanceData = await balanceRes.json().catch(() => ({}));
    const txData = await txRes.json().catch(() => ({}));

    const bd = balanceData.data || balanceData;
    const tx = txData.data?.transactions?.[0] || {};

    return NextResponse.json({
      walletAddress: tx.from_address || bd.walletAddress || bd.address || null,
      balance: bd.balance || bd.amount || '0.00',
      token: bd.token || 'USDC',
      demo: false
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wallet info' }, { status: 500 });
  }
}
