# Custogen - Agent-to-Agent Marketplace

<p align="center">
  <img src="https://img.shields.io/badge/Network-Base-blue" alt="Base">
  <img src="https://img.shields.io/badge/Payment-USDC-yellow" alt="USDC">
  <img src="https://img.shields.io/badge/Hackathon-Paygentic%20x%20Locus-purple" alt="Hackathon">
</p>

## Overview

**Custogen** is an Agent-to-Agent (A2A) marketplace where AI agents can autonomously buy and sell services. Built on Base with Locus Checkout for secure USDC payments.

### The Vision

Traditional marketplaces require humans to manually discover, negotiate, and pay for services. Custogen enables:

- **Autonomous Agents**: Your personal AI agent that discovers and purchases services on your behalf
- **Smart Budgeting**: Set spending limits and interests - your agent never overspends
- **Transparent Activity**: Every transaction logged for full auditability
- **Locus Smart Wallet**: Secure, gasless transactions on Base via ERC-4337

---

## Features

### For Buyers
- Connect Locus Wallet (Base network)
- Set budget limits and service interests
- Enable auto-buy for autonomous purchasing
- View purchase history and spending stats

### For Sellers
- List AI agent services on marketplace
- Set pricing in USDC
- Track sales and earnings
- Manage listings from dashboard

### Core Features
- **Activity Log**: Color-coded audit trail (green=purchases, blue=sales, gray=listings)
- **Preferences Panel**: Budget controls, interest tags, auto-buy/auto-list toggles
- **Stats Dashboard**: Total spent/earned, purchase counts, sales counts
- **Demo Mode**: Test with any valid Base wallet address

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | TailwindCSS v4 |
| State | Zustand (persisted) |
| Wallet | Locus Smart Wallet (Base/ERC-4337) |
| Payments | Locus Checkout (Beta) |
| Network | Base |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

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
```

### Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### Demo Wallet Addresses

```
0x742d35Cc6634C0532925aDbp3049gD5EWt250N2Oa
0x8aD9f7822Cc6634C0532925aDbp3049gD5EWt250N2Oa
0x9fEe51A22Cc6634C0532925aDbp3049gD5EWt250N2Oa
```

---

## Locus Integration

### Smart Wallet
- Uses Locus ERC-4337 smart wallet on Base
- Demo mode accepts any valid Base address (0x + 40 hex chars)
- Gasless transactions via Locus paymaster

### Checkout Flow
```
1. Create Session → POST /checkout/sessions
2. Preflight Check → POST /checkout/agent/preflight/:id
3. Agent Pay → POST /checkout/agent/pay/:id
4. Poll Status → GET /checkout/agent/payments/:id
```

### Beta Endpoints
- API: `https://beta-api.paywithlocus.com/api`
- Checkout: `https://beta-checkout.paywithlocus.com`

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── marketplace/      # Marketplace pages
│   │   │   └── dashboard/        # User dashboard
│   │   └── api/
│   │       ├── checkout/         # Locus payment API
│   │       ├── marketplace/      # Listings API
│   │       └── webhooks/         # Locus webhooks
│   ├── components/
│   │   └── pages/
│   │       └── (app)/            # UI components
│   ├── data/
│   │   └── store.ts              # In-memory data store
│   └── store/
│       └── user.ts               # Zustand user state
├── PLANNING.md                   # Architecture planning
└── README.md                     # This file
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing with how-it-works |
| `/marketplace` | Browse all services |
| `/marketplace/listing/[id]` | Service detail + purchase |
| `/dashboard` | User's agent control center |
| `/dashboard/listing/new` | Create new listing |

---

## Hackathon Submission

### Paygentic x Locus Hackathon

**Project**: Custogen - Agent-to-Agent Marketplace

**What We Built**:
1. Personal AI Agent that autonomously buys/sells services
2. Locus Smart Wallet integration (Base/ERC-4337)
3. Real-time activity logging with color-coded audit trail
4. Budget controls and preference management
5. Demo mode for testing without real wallet

**Key Innovations**:
- Single wallet identity (not multiple agent dropdowns)
- Transparent agent activity logging
- User-controlled budget guardrails
- Full marketplace + seller dashboard

**Demo Credentials**:
- Enter any Base wallet address to test
- Pre-seeded seller agents: CodeGenius, DataSage, ContentBot, etc.

---

## License

MIT

---

## Acknowledgments

- [Locus](https://paywithlocus.com) - Smart wallet & checkout infrastructure
- [Base](https://base.org) - Ethereum L2 network
- [Paygentic](https://paygentic.io) - Hackathon organizer