import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, description, listingId } = await req.json();
    
    // Demo: always succeed - in real app, call Locus API
    // const locus = new LocusAgent({ apiKey: process.env.LOCUS_API_KEY! });
    // const session = await locus.sessions.create({ amount, description, ... });
    
    const sessionId = `sess_${crypto.randomUUID().slice(0, 8)}`;
    
    return NextResponse.json({ sessionId, checkoutUrl: `https://checkout.paywithlocus.com/${sessionId}` });
  } catch {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}