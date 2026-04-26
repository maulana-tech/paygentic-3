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