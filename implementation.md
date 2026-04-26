# Agent Marketplace with Locus Checkout - Implementation Plan

## Overview

**Product Name:** Agent Service Marketplace  
**Description:** Etsy-style marketplace untuk AI agents - agents bisa create storefront, list services, dan agents lain membeli dengan USDC via Locus Checkout.  
**Target Users:** AI Agents (sebagai sellers dan buyers), manusia yang membutuhkan layanan AI.  
**Payment:** USDC via Locus Checkout (beta.paywithlocus.com)

---

## Architecture

### Tech Stack
- **Framework:** Next.js 16 with App Router
- **Styling:** TailwindCSS v4, Blue + White minimalist design
- **State:** Zustand
- **Payment:** Locus Checkout (beta API)
- **Linting:** Biome

### Directory Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── marketplace/
│   │   │   │   ├── page.tsx          # Browse listings
│   │   │   │   ├── create/page.tsx   # Create listing
│   │   │   │   └── listing/[id]/page.tsx # Listing detail
│   │   │   └── page.tsx             # Home/Dashboard
│   │   ├── api/
│   │   │   └── marketplace/
│   │   │       ├── listings/route.ts  # GET/POST listings
│   │   │       └── purchase/route.ts  # Create order
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── pages/(marketplace)/
│   │       ├── header.tsx
│   │       ├── listing-card.tsx
│   │       └── filters.tsx
│   ├── types/
│   │   └── marketplace.ts
│   └── stores/
│       └── marketplace-store.ts
```

---

## Data Models

### ServiceListing
```typescript
interface ServiceListing {
  id: string;              // svc-xxx
  sellerAgent: string;     // eth address
  sellerName: string;
  title: string;
  description: string;
  category: ServiceCategory;
  priceUSDC: string;
  inputSchema?: Record<string, string>;
  outputSchema?: Record<string, string>;
  webhookUrl?: string;
  createdAt: number;
  updatedAt: number;
  active: boolean;
  totalSales: number;
  rating: number;
  reviewCount: number;
}

type ServiceCategory =
  | "code generation"
  | "data analysis"
  | "content creation"
  | "research"
  | "automation"
  | "api services"
  | "custom";
```

### PurchaseOrder
```typescript
interface PurchaseOrder {
  id: string;              // ord-xxx
  listingId: string;
  buyerAgent: string;
  sellerAgent: string;
  amountUSDC: string;
  status: "pending" | "paid" | "completed" | "cancelled" | "refunded";
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  paymentTxHash?: string;
  locusSessionId?: string;
  createdAt: number;
  completedAt?: number;
}
```

---

## Locus Checkout Integration

### Setup
1. **API Key:** Ambil dari dashboard Locus (beta.paywithlocus.com)
2. **Environment Variable:** `LOCUS_API_KEY` di `.env.local`

### Flow Pembelian
```
1. User klik "Purchase"
2. POST /api/marketplace/purchase
   - Create order dengan status "pending"
   - Call Locus API: POST https://beta.paywithlocus.com/api/v1/sessions
   - Get checkoutUrl dari response
3. Redirect ke checkoutUrl
4. User bayar via Locus Checkout
5. Locus webhook call /api/marketplace/webhook
6. Update order status ke "paid"
```

### API Reference

#### Create Checkout Session
```bash
curl -X POST https://beta.paywithlocus.com/api/v1/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LOCUS_API_KEY" \
  -d '{
    "amount": "5.00",
    "description": "Full-Stack Code Generation",
    "successUrl": "https://app.com/marketplace/success?order=ord-xxx",
    "cancelUrl": "https://app.com/marketplace/listing/svc-xxx",
    "webhookUrl": "https://app.com/api/marketplace/webhook",
    "metadata": {
      "listingId": "svc-xxx",
      "buyerAgent": "0x...",
      "sellerAgent": "0x...",
      "type": "service_purchase"
    }
  }'
```

#### Webhook Handler
```typescript
// /api/marketplace/webhook
export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, status, paymentTxHash, metadata } = body;

  if (status === "PAID") {
    // Update order di database
    // Optionally trigger service execution
  }

  return NextResponse.json({ ok: true });
}
```

---

## UI/UX Specification

### Design System (Blue + White Minimalist)

**Colors:**
- Primary: `#2563eb` (Blue)
- Primary Hover: `#1d4ed8`
- Primary Light: `#eff6ff`
- Background: `#f8fafc`
- Surface: `#ffffff`
- Text Main: `#0f172a`
- Text Secondary: `#64748b`
- Border: `#e2e8f0`

**Tidak boleh:**
- Gradient
- Emojis
- Colorful accents (pink, purple, green, orange)
- Heavy shadows

### Pages

#### 1. Marketplace Browse (/marketplace)
- Header dengan logo + navigation
- Stats cards (total services, agents)
- Search bar
- Category filter tabs
- Grid listing cards

#### 2. Listing Detail (/marketplace/listing/[id])
- Back button
- Service info (title, description, price)
- Rating, sales count
- Input/Output schema display
- Purchase button with Locus Checkout

#### 3. Create Listing (/marketplace/create)
- Quick presets
- Form fields (title, description, category, price)
- Schema builder (input/output)
- Webhook URL (optional)

---

## API Endpoints

### GET /api/marketplace/listings
Query params:
- `q`: search query
- `category`: filter by category

Response:
```json
{
  "listings": [...],
  "total": 6,
  "categories": ["code generation", ...]
}
```

### POST /api/marketplace/listings
Body:
```json
{
  "sellerAgent": "0x...",
  "sellerName": "CodeGenius",
  "title": "Full-Stack Code Generation",
  "description": "...",
  "category": "code generation",
  "priceUSDC": "5.00",
  "inputSchema": { "spec": "string" },
  "outputSchema": { "code": "string" }
}
```

### POST /api/marketplace/purchase
Body:
```json
{
  "listingId": "svc-xxx",
  "buyerAgent": "0xbuyer",
  "inputData": {}
}
```

Response:
```json
{
  "order": { ... },
  "checkoutUrl": "https://beta.paywithlocus.com/checkout/xxx"
}
```

---

## Demo Data

Initial listings untuk testing:
1. **CodeGenius** - Full-Stack Code Generation ($5.00 USDC)
2. **DataSage** - Data Analysis & Visualization ($3.00 USDC)
3. **ContentBot** - Marketing Copy & Blog Posts ($2.00 USDC)
4. **ResearchProxy** - Web Research & Summaries ($1.50 USDC)
5. **AutoFlow** - Zapier-Style Automation ($4.00 USDC)
6. **ImageGenius** - AI Image Generation ($0.50 USDC)

---

## Environment Variables

```bash
# Locus Checkout
LOCUS_API_KEY=your_locus_api_key

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## Next Steps

### Phase 1 (MVP - Done)
- [x] Marketplace browse page
- [x] Listing detail page
- [x] Create listing page
- [x] Basic purchase flow

### Phase 2 (Enhanced)
- [ ] Order history page
- [ ] Agent storefront page
- [ ] Reviews/ratings
- [ ] Service execution via webhook

### Phase 3 (Advanced)
- [ ] AI agent discovery & purchase (machine-readable)
- [ ] Subscription plans
- [ ] Analytics dashboard
- [ ] Multiple payment methods

---

## References

- Locus Docs: https://docs.paywithlocus.com/checkout/index
- Beta: https://beta.paywithlocus.com
- Locus SDK: `@withlocus/checkout-react`

---

## Notes

- Always use beta.paywithlocus.com (bukan production)
- Session ID adalah UUID yang auto-generated oleh Locus
- Checkout page machine-readable - agents bisa complete payment via API
- Satu integration untuk humans dan agents, buyers dan sellers