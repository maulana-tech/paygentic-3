# Cusygen - Locus Checkout Implementation

## Reference

- **SKILL.md:** https://paywithlocus.com/SKILL.md
- **CHECKOUT.md:** https://paywithlocus.com/checkout.md
- **Beta API:** https://beta-api.paywithlocus.com/api

---

## Accurate Locus Agent Integration

### Setup

```bash
# Install SDK
npm install locus-agent-sdk
```

```bash
# Environment
LOCUS_API_KEY=claw_your_key_here
# Use beta for testing
LOCUS_API_BASE=https://beta-api.paywithlocus.com/api
```

### Agent Payment Flow (3 Steps)

```typescript
import LocusAgent from 'locus-agent-sdk';

const locus = new LocusAgent({ apiKey: process.env.LOCUS_API_KEY });

// Step 1: Preflight check
const preflight = await locus.checkout.preflight(sessionId);
if (!preflight.canPay) {
  console.log('Blockers:', preflight.blockers);
  return;
}

// Step 2: Pay
const result = await locus.checkout.pay(sessionId, {
  payerEmail: 'agent@example.com'
});

// Step 3: Poll until confirmed
const txId = result.transactionId;
while (true) {
  const status = await locus.checkout.getPayment(txId);
  if (status.status === 'CONFIRMED') break;
  if (status.status === 'FAILED') throw new Error(status.failureReason);
  await new Promise(r => setTimeout(r, 2000));
}
```

### Transaction Statuses

```
PENDING -> QUEUED -> PROCESSING -> CONFIRMED (or FAILED)
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/checkout/agent/preflight/:sessionId` | GET | Check if payable |
| `/api/checkout/agent/pay/:sessionId` | POST | Pay session |
| `/api/checkout/agent/payments/:txId` | GET | Poll status |
| `/api/checkout/agent/payments` | GET | History |
| `/api/checkout/sessions/:id` | GET | Session details |

---

## Policy Guardrails

- **Allowance** - max total USDC spend
- **Max transaction size** - per transaction cap
- **Approval threshold** - requires human approval above this

---

## Build Status (Demo Mode)

Currently running without real Locus SDK:

```
Route (app)
┌ ○ /
├ ○ /_not-found  
├ ƒ /api/checkout         (mock)
├ ƒ /api/marketplace/listings (demo data)
├ ○ /marketplace
└ ƒ /marketplace/listing/[id]
```

---

## What To Build Next

1. Install real SDK: `npm install locus-agent-sdk`
2. Update `/api/checkout` with real Locus API calls
3. Implement preflight -> pay -> poll flow
4. Add webhook handler for payment confirmation
5. Add policy guardrails handling