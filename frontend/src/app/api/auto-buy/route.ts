import { NextResponse } from 'next/server';
import { listings, getListingById, purchases, addActivityLog, Preferences, defaultPreferences } from '@/data/store';

interface AutoBuyMatch {
  listing: typeof listings[0];
  matchScore: number;
  reasons: string[];
}

export async function POST(req: Request) {
  try {
    const { buyerUserId, preferences } = await req.json();
    
    if (!preferences.autoBuyEnabled) {
      return NextResponse.json({ matches: [], reason: 'Auto-buy not enabled' });
    }
    
    const maxBudget = parseFloat(preferences.maxPurchaseBudget || '10');
    const threshold = parseFloat(preferences.autoBuyThreshold || preferences.maxPurchaseBudget || '5');
    const interests = preferences.interests || [];
    
    const matches: AutoBuyMatch[] = [];
    
    for (const listing of listings) {
      if (!listing.active) continue;
      if (listing.userId === buyerUserId) continue;
      
      const price = parseFloat(listing.priceUSDC);
      if (price > maxBudget) continue;
      
      let matchScore = 0;
      const reasons: string[] = [];
      
      // Category match (highest priority)
      const categoryMatch = interests.some((i: string) => 
        listing.category.toLowerCase().includes(i.toLowerCase()) ||
        i.toLowerCase().includes(listing.category.toLowerCase())
      );
      if (categoryMatch) {
        matchScore += 50;
        reasons.push('Category matches your interests');
      }
      
      // Price match (under auto-buy threshold gets bonus)
      if (price <= threshold) {
        matchScore += 30;
        reasons.push('Under auto-approve threshold');
      } else {
        matchScore += 20;
        reasons.push('Within max budget');
      }
      
      // Sales count as trust indicator
      if (listing.totalSales > 100) {
        matchScore += 15;
        reasons.push('Highly trusted service');
      } else if (listing.totalSales > 50) {
        matchScore += 10;
        reasons.push('Popular service');
      }
      
      // Lower price gets slight bonus
      if (price < 5) {
        matchScore += 5;
        reasons.push('Budget-friendly');
      }
      
      if (matchScore >= 30 && categoryMatch) {
        matches.push({
          listing,
          matchScore,
          reasons
        });
      }
    }
    
    // Sort by score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // Auto-purchase top match if score is high enough
    const topMatch = matches[0];
    if (topMatch && topMatch.matchScore >= 60) {
      // Would trigger auto-purchase here
      addActivityLog(buyerUserId, 'INFO', `Auto-buy matched: ${topMatch.listing.title}`, {
        listing: topMatch.listing.title,
        price: topMatch.listing.priceUSDC,
        score: topMatch.matchScore.toString(),
        reasons: topMatch.reasons.join(', ')
      });
      
      return NextResponse.json({
        matches: matches.slice(0, 5),
        recommended: topMatch,
        autoBuyTriggered: true
      });
    }
    
    return NextResponse.json({
      matches: matches.slice(0, 5),
      recommended: null,
      autoBuyTriggered: false
    });
  } catch (error) {
    console.error('Auto-buy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const userPrefs = searchParams.get('preferences');
  
  // Return match suggestions without auto-purchasing
  if (!userId || !userPrefs) {
    return NextResponse.json({ error: 'Missing userId or preferences' }, { status: 400 });
  }
  
  try {
    const preferences = JSON.parse(decodeURIComponent(userPrefs));
    const maxBudget = parseFloat(preferences.maxPurchaseBudget || '10');
    const interests = preferences.interests || [];
    
    const matches: AutoBuyMatch[] = [];
    
    for (const listing of listings) {
      if (!listing.active) continue;
      
      const price = parseFloat(listing.priceUSDC);
      if (price > maxBudget) continue;
      
      let matchScore = 0;
      const reasons: string[] = [];
      
      const categoryMatch = interests.some((i: string) => 
        listing.category.toLowerCase().includes(i.toLowerCase()) ||
        i.toLowerCase().includes(listing.category.toLowerCase())
      );
      if (categoryMatch) {
        matchScore += 50;
        reasons.push('Category matches');
      }
      
      if (listing.totalSales > 100) {
        matchScore += 20;
        reasons.push('Popular');
      }
      
      if (matchScore >= 30 && categoryMatch) {
        matches.push({ listing, matchScore, reasons });
      }
    }
    
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({ matches: matches.slice(0, 10) });
  } catch (error) {
    console.error('Auto-buy get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}