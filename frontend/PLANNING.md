# Agent-to-Agent Marketplace - Final Plan

## Core Concept
**Your Personal AI Agent** - Connect via Locus Wallet, then your agent autonomously buys/sells services on your behalf.

---

## Tech Stack & Config

### Important: Locus Beta
- **API Base**: `https://beta-api.paywithlocus.com/api`
- **Checkout**: `https://beta-checkout.paywithlocus.com`
- **Wallet**: `https://beta-pay.paywithlocus.com` (or similar)

---

## Data Model

### User (Locus Wallet-based)
```typescript
User {
  id: string                    // locus user ID
  walletAddress: string         // EOA from Locus Wallet
  email?: string                // Locus account email
  locusAccountId: string        // Locus internal ID
  createdAt: string
}

Preferences {
  maxPurchaseBudget: string     // max $ per transaction (default: 10)
  monthlyBudget: string         // max $ per month (default: 100)
  interests: string[]           // ["code generation", "data analysis"]
  autoBuyEnabled: boolean       // enable autonomous buying
  autoBuyThreshold: string      // auto-approve under this amount
  autoListEnabled: boolean      // allow auto-listing services
}

AgentStats {
  totalSpent: string
  totalEarned: string
  purchasesCount: number
  salesCount: number
}
```

### Seller Agents (Fixed)
- CodeGenius, DataSage, ContentBot, etc.
- Pre-seeded for marketplace diversity

### Purchases
```typescript
Purchase {
  id: string
  listingId: string
  sellerAgentId: string
  buyerUserId: string           // your user ID
  transactionId?: string
  status: PENDING | CONFIRMED | FAILED
  amount: string
  autoPurchased: boolean
  createdAt: string
}
```

### Listings
```typescript
Listing {
  id: string
  userId: string                // creator (can be user or agent)
  title: string
  description: string
  category: string
  priceUSDC: string
  active: boolean
  totalSales: number
  createdAt: string
}
```

---

## Pages

### 1. Landing (`/`)
- Hero: "Your Personal AI Agent for Agent Marketplace"
- "Connect Locus Wallet" button
- Features grid
- How it works 3-step

### 2. Dashboard (`/dashboard`)
**Left Panel - Agent Stats**
- Total Spent / Total Earned
- Purchases count / Sales count
- This month stats

**Center Panel - Agent Control**
- Auto-buy toggle + settings
- Auto-list toggle + settings
- Budget inputs
- Interest tags

**Right Panel - Activity Log**
- Timestamped entries
- Color-coded: purchase (green), sale (blue), error (red)
- Expandable details
- Filter by type

**Bottom Panel - Services**
- Tab: "My Purchases" / "My Listings"
- Quick actions: view, relist, toggle active

### 3. Marketplace (`/marketplace`)
- Search + filter by category
- Grid of service cards
- Each shows: title, category, price, seller, rating
- "Auto-buy eligible" badge for matching preferences

### 4. Listing Detail (`/listing/[id]`)
- Full service info
- Seller info
- Manual Buy button
- "Let My Agent Handle It" - sends to autonomous flow

### 5. Create/Edit Listing (`/dashboard/listing/new`)
- Title, description, category
- Price in USDC
- Preview before publish

---

## Locus Integration

### Wallet Connection
- Use Locus Wallet SDK or embed
- Flow: User clicks "Connect Locus Wallet" → Locus popup → returns wallet address + user ID
- Store: walletAddress, locusAccountId

### Checkout Flow
1. **Create Session**: POST to `/checkout/sessions`
2. **Agent Preflight**: Check if agent can pay
3. **Agent Pay**: Execute payment
4. **Poll Status**: Wait for confirmation
5. **Webhook**: Handle async confirmation

### Important Endpoints
```
Base: https://beta-api.paywithlocus.com/api

POST /checkout/sessions         - Create payment session
GET  /checkout/sessions/:id     - Get session status
POST /checkout/agent/preflight/:sessionId - Check if agent can pay
POST /checkout/agent/pay/:sessionId - Agent pays
GET  /checkout/agent/payments/:id - Get payment status
POST /webhooks/locus            - Handle async events
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/connect` | POST | Connect Locus wallet |
| `/api/user` | GET | Get current user |
| `/api/user/preferences` | GET/PUT | User preferences |
| `/api/user/agent/buy` | POST | Trigger autonomous buy |
| `/api/user/agent/list` | POST | Create listing as user |
| `/api/user/purchases` | GET | User's purchases |
| `/api/user/listings` | GET | User's listings |
| `/api/checkout` | POST | Handle checkout |

---

## Activity Log UI

### Log Entry Types
1. **PURCHASE** - Agent bought something
   - Green left border
   - Icon: credit card
   - Shows: service name, amount, seller

2. **SALE** - Someone bought from user
   - Blue left border  
   - Icon: dollar
   - Shows: service name, amount, buyer

3. **LISTING_CREATED** - User created listing
   - Gray left border
   - Icon: plus
   - Shows: listing title, price

4. **ERROR** - Something failed
   - Red left border
   - Icon: alert
   - Shows: error message

### Log Entry Component
```
┌─────────────────────────────────────────┐
│ ○ PURCHASE          Jan 15, 2026 2:30PM │
│ ─────────────────────────────────────── │
│ Bought "Full-Stack Code Generation"     │
│ from CodeGenius for $5.00 USDC          │
│ ✓ Transaction confirmed                 │
└─────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1 - Core (Day 1)
- [ ] User model + Locus wallet connect
- [ ] Preferences management
- [ ] Dashboard layout with 3 panels
- [ ] Activity log component (styled)

### Phase 2 - Buying (Day 2)
- [ ] Marketplace listings
- [ ] Manual purchase flow
- [ ] Autonomous buy flow
- [ ] Purchase history

### Phase 3 - Selling (Day 3)
- [ ] Create/edit listing form
- [ ] My listings management
- [ ] Auto-list functionality
- [ ] Sales tracking

### Phase 4 - Polish (Day 4)
- [ ] Enhanced activity log with filters
- [ ] Notifications
- [ ] Mobile responsive
- [ ] Loading states

---

## Environment Variables
```env
LOCUS_API_KEY=claw_dev_xxx
LOCUS_API_BASE=https://beta-api.paywithlocus.com/api
LOCUS_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_URL=https://your-domain.com
LOCUS_WALLET_URL=https://beta-pay.paywithlocus.com
```

---

## Key UX Decisions

1. **Single Wallet**: One Locus wallet per user
2. **Transparent Agent**: Every action logged with timestamps
3. **Budget Guardrails**: Never exceed user-set limits
4. **Opt-in Auto**: Default is manual, user enables auto
5. **Clear State**: Dashboard always shows agent status (active/inactive)

---

## Demo Mode
Without Locus API key:
- Mock wallet connection (enter any address)
- Simulated purchases (instant confirmation)
- Demo agent behavior

---

## Success Metrics
- [ ] User can connect Locus wallet
- [ ] Dashboard shows all 3 panels
- [ ] Activity log displays styled entries
- [ ] Manual purchase works
- [ ] Autonomous buy works
- [ ] User can create listings
- [ ] Mobile responsive

---

# Paygentic Hackathon - Winning Features Plan

## Hackathon Theme: CheckoutWithLocus

Target: Agent-to-Agent Marketplace with autonomous purchasing capabilities.
Designed to impress judges on: Technical Excellence (30), Innovation (25), Business Impact (25), UX (20).

---

## New Features for Winning

### Feature 1: Auto-Negotiation ⭐⭐⭐
**Innovation Score: High**
Buyer agent can propose price, seller agent can accept/counter.
Shows sophisticated agent autonomy - impressive for judges.

```
Buyer: "I'll pay $3 for this service"
Seller: [Accept] / [Counter at $4] / [Decline]
```

**Data Model:**
```typescript
Negotiation {
  id: string
  listingId: string
  buyerUserId: string
  originalPrice: string
  offeredPrice: string
  status: PENDING | ACCEPTED | COUNTERED | DECLINED | EXPIRED
  buyerMessage?: string
  sellerResponse?: string
  createdAt: string
  updatedAt: string
}
```

### Feature 2: Subscription/Recurring Revenue ⭐⭐⭐
**Business Impact: High**
Agents can offer monthly plans, auto-charge at intervals.
Shows real business model - recurring revenue.

```
Listing Plan Options:
- One-time: $5
- Monthly: $30/month (save 40%)
- Annual: $300/year (save 50%)
```

**Data Model:**
```typescript
Subscription {
  id: string
  listingId: string
  buyerUserId: string
  planType: 'monthly' | 'annual'
  amount: string
  nextBillingDate: string
  status: ACTIVE | PAUSED | CANCELLED
  transactionId?: string
  createdAt: string
}
```

### Feature 3: Reputation System ⭐⭐
**Trust Building: Critical**
Rating after transaction (1-5 stars).
Weighted score displayed on profiles.

```
Seller Rating: 4.7 ⭐ (127 reviews)
- Quality: 4.8
- Speed: 4.5
- Communication: 4.9
```

**Data Model:**
```typescript
Review {
  id: string
  purchaseId: string
  sellerAgentId: string
  buyerUserId: string
  rating: number           // 1-5
  qualityScore: number    // 1-5
  speedScore: number     // 1-5
  commScore: number      // 1-5
  comment?: string
  createdAt: string
}
// Computed: avg ratings per seller
```

### Feature 4: Auto-Purchase with Budget ⭐⭐
**Technical Score: High**
Buyer sets max budget, agent automatically buys best matching service.
Shows AI agent making financial decisions autonomously.

```
User Settings:
- Max purchase: $10
- Monthly budget: $100
- Auto-buy enabled: true

Agent Behavior:
1. Monitors marketplace for matching interests
2. Ranks by: price < max, rating > 4.0, category match
3. Auto-purchases if under threshold
4. Logs decision in activity log
```

---

## Implementation Priority

| Week | Feature | Points Impact | Complexity |
|------|---------|---------------|------------|
| Day 1 | Auto-Negotiation | Innovation +15 | Medium |
| Day 2 | Auto-Buy Enhancement | Technical +10 | Low |
| Day 3 | Subscription Model | Business +15 | Medium |
| Day 4 | Reputation System | UX +10 | Low |
| Day 5 | Polish & Demo | UX +10 | Low |

---

## Page Updates

### New: Negotiation View (`/marketplace/listing/[id]/negotiate`)
- Make offer interface
- View counter-offer
- Accept/Decline buttons

### New: Subscription Management (`/dashboard/subscriptions`)
- Active subscriptions list
- Pause/Cancel controls
- Billing history

### Updated: Seller Profile
- Star ratings display
- Review count
- Response time

### Updated: Auto-Buy Settings
- Interest matching
- Max price threshold
- Auto-approve rules

---

## Technical Implementation

### Auto-Negotiation Flow
```
1. Buyer makes offer → POST /api/negotiations
2. Seller receives notification
3. Seller responds (accept/counter/decline)
4. If accepted → Create purchase → Process payment
5. Log in activity
```

### Subscription Flow
```
1. Buyer selects monthly plan
2. Create session with metadata: { recurring: true, interval: 'monthly' }
3. First payment → CONFIRMED
4. Webhook triggers next billing at interval
5. Process auto-charge each period
6. Pause/Cancel anytime
```

### Reputation Flow
```
1. Purchase completes
2. Prompt for review (optional)
3. Submit review → POST /api/reviews
4. Recalculate seller scores
5. Display on marketplace + listing
```

### Auto-Buy Flow
```
1. Cron job every 5 min (or webhook-driven)
2. Query marketplace with preferences
3. Filter: category match, price < threshold, rating > 4
4. Sort by: price asc, rating desc
5. If match + under autoBuyThreshold → auto-purchase
6. Log in activity with "AUTO" tag
```

---

## Demo Scenario for Judges

```
1. Connect wallet (Base address)
2. View marketplace with 18+ services
3. Make manual purchase → confirms instantly via webhook
4. Enable auto-buy → agent finds matching service → auto-purchases
5. Create listing → auto-list enabled
6. View negotiation process → counter-offer demo
7. Check activity log → all transactions logged
8. Show stats → revenue/expense tracking
```

---

## Competition Differentiators

| Feature | Us | Typical Entry |
|--------|----|---------------|
| Auto-Negotiation | ✓ | ✗ |
| Subscriptions | ✓ | ✗ |
| Reputation System | ✓ | ✗ |
| Auto-Buy | ✓ | Basic only |
| Real Locus Integration | ✓ | May skip |
| Activity Logging | ✓ | ✗ |
| Multi-agent Marketplace | ✓ | Single agent |

---

## Files to Create/Update

### New Files
- `src/data/negotiation.ts` - Negotiation model + logic
- `src/data/subscription.ts` - Subscription model + logic  
- `src/data/review.ts` - Review model + logic
- `src/app/api/negotiations/route.ts` - Negotiation API
- `src/app/api/subscriptions/route.ts` - Subscription API
- `src/app/api/reviews/route.ts` - Review API
- `src/components/pages/(app)/negotiation-panel.tsx` - Negotiation UI
- `src/components/pages/(app)/subscription-panel.tsx` - Subscription UI

### Update Files
- `src/data/store.ts` - New models
- `src/app/api/checkout/route.ts` - Support subscriptions
- `src/components/pages/(app)/preferences-panel.tsx` - Auto-buy enhanced
- `src/components/pages/(app)/activity-log.tsx` - New event types

---

## Key Metrics for Submission

- [ ] Auto-negotiation works (offer → accept/counter)
- [ ] Subscription create + manage
- [ ] Reviews with star ratings
- [ ] Auto-buy triggers automatically
- [ ] Activity log shows all events
- [ ] Working demo with real Locus checkout

---

# Phase 6: Post-Payment Service Delivery

## Problem

After payment is confirmed, buyer has no way to access/use the service they purchased.

## Solution: Service Delivery Flow

### Complete Purchase Flow

```
1. User selects service
2. Make payment via Locus Checkout
3. Payment CONFIRMED (webhook)
4. Generate access credentials
5. Notify seller of sale
6. Deliver credentials to buyer
7. Buyer accesses service
8. Optional: Leave review
```

### Implementation

#### 1. Add ServiceAccess Model

```typescript
interface ServiceAccess {
  id: string;
  purchaseId: string;
  listingId: string;
  buyerUserId: string;
  accessToken: string;        // API key for service
  accessTokenCreated: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED';
}
```

#### 2. Webhook Enhancement

```typescript
// /api/webhooks/locus/route.ts

// After payment confirmed:
1. Generate service access token
2. Save ServiceAccess record
3. Send webhook to seller
4. Email credentials to buyer
5. Show success page with access
```

#### 3. Success Page

Create page `/purchase/success/[id]` showing:
- Purchase confirmation
- Service details
- Access instructions
- Generated credentials (if applicable)

#### 4. Service API Key Generator

```typescript
// Generate simple access token
accessToken = crypto.randomUUID().slice(0, 16)
// Or use API key format: cusygen_[service]_[random]
```

---

## Files to Create/Update

### New Files
- `src/data/service-access.ts` - Service access model
- `src/app/api/service-access/route.ts` - Access management
- `src/app/(main)/purchase/success/[id]/page.tsx` - Success page

### Update Files
- `src/app/api/webhooks/locus/route.ts` - Handle delivery
- `src/components/pages/(marketplace)/LocusPayment.tsx` - Redirect to success

---

## Mock Service Access (for demo)

For demo purposes, services don't need real API keys. Just show access instructions:

```
┌─────────────────────────────────────────┐
│        PURCHASE COMPLETE!                │
├─────────────────────────────────────────┤
│ Service: Full-Stack Code Generation     │
│ From: CodeGenius                        │
│ Amount: $0.10 USDC                      │
│ Status: CONFIRMED                       │
├─────────────────────────────────────────┤
│ Next steps:                             │
│ 1. This service is now active         │
│ 2. You can re-list or manage it        │
│ 3. Leave a review after use            │
└─────────────────────────────────────────┘
```

---

## Summary: Complete Purchase Flow

```
User                         Marketplace                    Locus               Seller
  │                              │                           │                    │
  │── Browse services ───────────>│                           │                    │
  │<─── Listing info ────────────│                           │                    │
  │                              │                           │                    │
  │── Click Buy ────────────────>│                           │                    │
  │<─── Checkout URL ───────────│                           │                    │
  │                              │                           │                    │
  │─── Pay with USDC ───────────>│                           │                    │
  │                             ─┼─── Payment ──────────────>│                    │
  │                             │<── CONFIRMED ─────────────│                    │
  │<───────────────────────────│                           │<── Webhook ────────│
  │                              │                           │                    │
  │── Success page ─────────────>│                           │                    │
  │   (show credentials)        │                           │                    │
  │                              │                           │                    │
  │── Use service ─────────────>│                           │                    │
  │   (API call / access)       │                           │                    │
```

---

## Implementation Priority

| Week | Feature | Effort | Impact |
|------|---------|--------|--------|
| 1 | Success redirect | Low | High (UX) |
| 2 | Access token model | Medium | High (Complete) |
| 3 | Webhook to seller | Low | Medium |
| 4 | Email credentials | Medium | High (Real) |

---

## Demo Mode (Current)

For hackathon demo, just show:
- Purchase confirmation
- Access instructions
- Next steps

No real API keys needed for demo.