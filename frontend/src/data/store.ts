export interface Agent {
  id: string;
  name: string;
  walletAddress: string;
  locusMerchantId?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  agentId: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  active: boolean;
  createdAt: string;
}

export interface Purchase {
  id: string;
  listingId: string;
  sellerAgentId: string;
  buyerAgentId: string;
  transactionId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  amount: string;
  createdAt: string;
}

export type PurchaseStatus = Purchase['status'];

export const agents: Agent[] = [
  {
    id: 'agent-001',
    name: 'CodeGenius',
    walletAddress: '0x742d35Cc6634C0532925aDbp3049gD5EWt250N2Oa',
    locusMerchantId: 'merchant_cg_001',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'agent-002',
    name: 'DataSage',
    walletAddress: '0x8aD9f7822Cc6634C0532925aDbp3049gD5EWt250N2Oa',
    locusMerchantId: 'merchant_ds_001',
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'agent-003',
    name: 'ContentBot',
    walletAddress: '0x9fEe51A22Cc6634C0532925aDbp3049gD5EWt250N2Oa',
    locusMerchantId: 'merchant_cb_001',
    createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: 'agent-004',
    name: 'ResearchProxy',
    walletAddress: '0x1a2B3c4D5Ee6F7890Aa1Bb2Cc3Dd4Ee5Ff6G7h8I9',
    createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 'agent-005',
    name: 'AutoFlow',
    walletAddress: '0x2b3C4d5Ee6F7890Aa1Bb2Cc3Dd4Ee5Ff6G7h8I9J0',
    createdAt: '2024-01-19T10:00:00Z'
  },
  {
    id: 'agent-006',
    name: 'ImageGenius',
    walletAddress: '0x3c4D5e6F7890Aa1Bb2Cc3Dd4Ee5Ff6G7h8I9J0K1',
    createdAt: '2024-01-20T10:00:00Z'
  }
];

export const listings: Listing[] = [
  {
    id: 'svc-001',
    agentId: 'agent-001',
    title: 'Full-Stack Code Generation',
    description: 'Generate complete React, Node.js, and Python applications from natural language specs.',
    category: 'code generation',
    priceUSDC: '5.00',
    active: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'svc-002',
    agentId: 'agent-002',
    title: 'Data Analysis & Visualization',
    description: 'Transform raw data into actionable insights with interactive dashboards.',
    category: 'data analysis',
    priceUSDC: '3.00',
    active: true,
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'svc-003',
    agentId: 'agent-003',
    title: 'Marketing Copy & Blog Posts',
    description: 'SEO-optimized content for websites, blogs, and social media.',
    category: 'content creation',
    priceUSDC: '2.00',
    active: true,
    createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: 'svc-004',
    agentId: 'agent-004',
    title: 'Web Research & Summaries',
    description: 'Comprehensive research on any topic with source citations.',
    category: 'research',
    priceUSDC: '1.50',
    active: true,
    createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 'svc-005',
    agentId: 'agent-005',
    title: 'Zapier-Style Automation',
    description: 'Create automated workflows between 500+ apps.',
    category: 'automation',
    priceUSDC: '4.00',
    active: true,
    createdAt: '2024-01-19T10:00:00Z'
  },
  {
    id: 'svc-006',
    agentId: 'agent-006',
    title: 'AI Image Generation',
    description: 'Custom images via DALL-E, Midjourney, or Stable Diffusion.',
    category: 'api services',
    priceUSDC: '0.50',
    active: true,
    createdAt: '2024-01-20T10:00:00Z'
  }
];

export const purchases: Purchase[] = [];

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getAgentByWallet(address: string): Agent | undefined {
  return agents.find(a => a.walletAddress.toLowerCase() === address.toLowerCase());
}

export function getListingsByAgent(agentId: string): Listing[] {
  return listings.filter(l => l.agentId === agentId);
}

export function getListingById(id: string): Listing | undefined {
  return listings.find(l => l.id === id);
}

export function getPurchasesBySeller(sellerAgentId: string): Purchase[] {
  return purchases.filter(p => p.sellerAgentId === sellerAgentId);
}

export function getPurchasesByBuyer(buyerAgentId: string): Purchase[] {
  return purchases.filter(p => p.buyerAgentId === buyerAgentId);
}