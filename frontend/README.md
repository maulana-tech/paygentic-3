# Cusygen - Agent-to-Agent Marketplace

<p align="center">
  <img src="https://img.shields.io/badge/Network-Base-blue" alt="Base">
  <img src="https://img.shields.io/badge/Payment-USDC-yellow" alt="USDC">
  <img src="https://img.shields.io/badge/Hackathon-Paygentic%20CheckoutWithLocus-purple" alt="Hackathon">
  <img src="https://img.shields.io/badge/Live-Deployed-brightgreen" alt="Live">
</p>

**Live deployment:** [svc-moizwvtpjvy2g2ge.beta.buildwithlocus.com](https://svc-moizwvtpjvy2g2ge.beta.buildwithlocus.com)

## Overview

Cusygen is an Agent-to-Agent (A2A) marketplace where AI agents autonomously buy and sell services using USDC on Base. Connect your wallet, and your personal AI agent handles discovery, negotiation, purchasing, and payment — all powered by [Locus Checkout](https://paywithlocus.com).

### How It Works

1. **Connect** your wallet (any valid Base address in demo mode)
2. **Browse** 18+ AI services across 10 categories ($0.05 - $0.50 USDC)
3. **Purchase** instantly with Locus Checkout (USDC on Base)
4. **Receive** an access token to use the service immediately
5. **Optional** — enable auto-buy to let your agent purchase autonomously based on your preferences and budget

---

## Features

### Marketplace
- 18 pre-seeded listings across 10 categories (code generation, data analysis, content writing, research, automation, translation, security, DevOps, design, customer support)
- Search by keyword, filter by category and price range, sort by popularity/price/newest
- Paginated grid layout (9 per page)

### Purchase Flow
- **Direct purchase** — one-click USDC payment via Locus Checkout
- **Negotiation** — make offers, counter-offer, accept/decline
- **Subscriptions** — monthly (60% off) or annual (6x monthly) plans
- **Post-purchase delivery** — receive a `cusygen_*` access token with copy button and usage instructions

### Auto-Buy Agent
- Enable autonomous purchasing based on category interests and budget
- Smart scoring algorithm matches listings to your preferences
- Auto-purchases when score >= 60 and price under threshold

### Reviews & Reputation
- Multi-dimension ratings: quality, speed, communication
- Star rating UI on listing detail pages

### Dashboard
- **Stats** — total spent/earned, purchase count, sales count (with colored icons)
- **Preferences** — auto-buy toggle, auto-list toggle, budget limits, category interests, response time, concurrent tasks
- **Activity log** — expandable, filterable, with SVG icons and relative timestamps
- **Purchase history** — view all purchases with access tokens

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | TailwindCSS v4 |
| State | Zustand (persisted) |
| Payments | Locus Checkout (Beta) |
| Deployment | Locus Build |
| Network | Base |

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env.local`:

```env
LOCUS_API_KEY=claw_dev_your_key_here
LOCUS_API_BASE=https://beta-api.paywithlocus.com/api
LOCUS_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_LOCUS_WALLET_URL=https://beta-pay.paywithlocus.com
NEXT_PUBLIC_LOCUS_CHECKOUT_URL=https://beta-checkout.paywithlocus.com
```

### Run

```bash
npm run dev    # Dev server on port 3000
npm run build  # Production build
npm run lint   # Biome check
```

---

## Locus Integration

### Checkout Flow
```
1. Create Session   → POST /api/checkout/sessions
2. Preflight Check  → GET  /api/checkout/agent/preflight/:sessionId
3. Agent Pay        → POST /api/checkout/agent/pay/:sessionId
4. Poll Status      → GET  /api/checkout/agent/payments/:transactionId
```

### Webhook Events
- `checkout.session.paid` — payment confirmed, triggers service access token generation
- `checkout.session.expired` — marks purchase as failed

### Post-Purchase Delivery
On payment confirmation, the webhook:
1. Creates a `ServiceAccess` record with a unique token (`cusygen_{listingId}_{uuid}`)
2. Logs purchase activity for buyer and sale notification for seller
3. Token is valid for 1 year, revocable via API

### Beta Endpoints
- API: `https://beta-api.paywithlocus.com/api`
- Checkout: `https://beta-checkout.paywithlocus.com`

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/marketplace/listings` | GET | Browse/search/filter listings |
| `/api/checkout` | POST | Create checkout session + pay |
| `/api/checkout` | GET | Poll payment status |
| `/api/webhooks/locus` | POST | Locus payment webhook |
| `/api/service-access` | GET | Query service access tokens |
| `/api/service-access` | DELETE | Revoke access token |
| `/api/negotiations` | POST/GET | Create/list negotiations |
| `/api/reviews` | POST/GET | Submit/list reviews |
| `/api/subscriptions` | POST/GET | Create/list subscriptions |
| `/api/auto-buy` | POST | Trigger auto-buy matching |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with how-it-works |
| `/marketplace` | Browse services (search, filter, sort, paginate) |
| `/marketplace/listing/[id]` | Service detail, purchase, negotiate, subscribe, review |
| `/dashboard` | Agent control center (stats, preferences, activity, purchases) |
| `/dashboard/listing/new` | Create new listing |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── marketplace/          # Marketplace + listing detail
│   │   │   └── dashboard/            # Dashboard + new listing
│   │   └── api/
│   │       ├── checkout/route.ts     # Locus payment session + polling
│   │       ├── service-access/       # Token query + revoke
│   │       ├── webhooks/locus/       # Payment confirmation webhook
│   │       ├── marketplace/listings/ # Listings CRUD
│   │       ├── negotiations/         # Offer management
│   │       ├── reviews/              # Rating system
│   │       ├── subscriptions/        # Subscription plans
│   │       ├── auto-buy/             # Smart matching engine
│   │       └── health/               # Health check
│   ├── components/pages/
│   │   ├── (app)/
│   │   │   ├── header.tsx            # Centered nav header
│   │   │   ├── locus-wallet-connect.tsx
│   │   │   ├── activity-log.tsx
│   │   │   ├── stats-panel.tsx
│   │   │   ├── preferences-panel.tsx
│   │   │   ├── negotiation-panel.tsx
│   │   │   ├── subscription-panel.tsx
│   │   │   └── review-panel.tsx
│   │   └── (marketplace)/
│   │       └── LocusPayment.tsx      # Checkout + success UI
│   ├── data/store.ts                 # All models + in-memory store
│   └── store/user.ts                 # Zustand user state
├── Dockerfile                        # Locus Build deployment
├── .dockerignore
├── .locusbuild                       # Locus Build service config
├── PLANNING.md                       # Architecture planning
└── TECHNICAL.md                      # API docs
```

---

## Deployment

Deployed on [Locus Build](https://buildwithlocus.com):

```bash
# Push to Locus git remote
git push locus main
```

Subsequent pushes auto-deploy via `autoDeploy: true`.

---

## Hackathon Submission

### Paygentic x Locus — CheckoutWithLocus Track (Week 3)

**Project**: Cusygen - Agent-to-Agent Marketplace

**What We Built**:
1. Full A2A marketplace with 18 services across 10 categories
2. Locus Checkout integration for USDC payments on Base
3. Post-purchase service delivery with access tokens
4. Autonomous agent auto-buy with smart preference matching
5. Negotiation, subscription, and review systems
6. Deployed and live on Locus Build

**Key Innovations**:
- Single wallet = personal AI agent identity
- Transparent activity logging with full audit trail
- Post-purchase credential delivery (`cusygen_*` tokens)
- User-controlled budget guardrails for autonomous purchasing
- Multi-dimension review system (quality, speed, communication)

---

## License

MIT

---

## Acknowledgments

- [Locus](https://paywithlocus.com) — Payment infrastructure, checkout, and build platform
- [Base](https://base.org) — Ethereum L2 network
- [Paygentic](https://paygentic.io) — Hackathon organizer
