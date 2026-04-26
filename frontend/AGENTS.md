# AGENTS.md

## Commands

```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Build for production
npm run lint   # Biome check
```

## Architecture

- **Framework:** Next.js 16 with App Router
- **Styling:** TailwindCSS v4, Blue + White minimalist design
- **State:** Zustand

## Locus Checkout Integration

### Environment Variables
```bash
# Required for real Locus integration
LOCUS_API_KEY=claw_your_key_here
LOCUS_API_BASE=https://beta-api.paywithlocus.com/api
LOCUS_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_URL=http://localhost:3000
```

### Agent Payment Flow

Step 1: Preflight check
```
POST /api/checkout/agent/preflight/:sessionId
```

Step 2: Pay
```bash
POST /api/checkout/agent/pay/:sessionId
{"payerEmail": "agent@example.com"}
```

Step 3: Poll status
```
GET /api/checkout/agent/payments/:transactionId
```

### Transaction Statuses
```
PENDING -> QUEUED -> PROCESSING -> CONFIRMED (or FAILED)
```

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/marketplace/listings` | Get service listings |
| `/api/checkout` | Create session + agent payment flow |
| `/api/webhooks/locus` | Handle Locus payment webhooks |

## Pages

| Page | Description |
|------|-------------|
| `/` | Home |
| `/marketplace` | Browse services |
| `/marketplace/listing/[id]` | Service detail + purchase |

## Design Constraints

- Primary: Blue (#2563eb), Background: #f8fafc
- No gradients, no emojis, no colorful accents