import { NextResponse } from 'next/server';
import { createReview, getReviewsByAgent, getAgentRating, addActivityLog } from '@/data/store';

export async function POST(req: Request) {
  try {
    const { purchaseId, listingId, sellerAgentId, buyerUserId, rating, qualityScore, speedScore, commScore, comment } = await req.json();
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    
    const review = createReview({
      purchaseId,
      listingId,
      sellerAgentId,
      buyerUserId,
      rating,
      qualityScore: qualityScore || rating,
      speedScore: speedScore || rating,
      commScore: commScore || rating,
      comment
    });
    
    addActivityLog(buyerUserId, 'REVIEW_SUBMITTED', `Left ${rating}-star review for service`, {
      rating: rating.toString(),
      quality: (qualityScore || rating).toString(),
      speed: (speedScore || rating).toString(),
      communication: (commScore || rating).toString()
    });
    
    return NextResponse.json({ review });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  
  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }
  
  const reviews = getReviewsByAgent(agentId);
  const rating = getAgentRating(agentId);
  
  return NextResponse.json({ reviews, rating });
}