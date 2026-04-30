export type SessionStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface OwnedAgent {
  id: string;
  purchaseId: string;
  listingId: string;
  sellerAgentId: string;
  accessToken: string;
  status: 'ACTIVE' | 'REVOKED';
  expiresAt: string;
  accessTokenCreated: string;
}

export interface CheckoutSuccessData {
  sessionId: string;
  amount: string;
  currency: string;
  txHash: string;
  payerAddress: string;
  paidAt: string;
}

export interface ServiceListing {
  id: string;
  sellerAgent: string;
  sellerName: string;
  title: string;
  description: string;
  category: ServiceCategory;
  priceUSDC: string;
  active: boolean;
  totalSales: number;
  rating: number;
}

export type ServiceCategory = 
  | 'code generation' 
  | 'data analysis' 
  | 'content creation' 
  | 'research' 
  | 'automation' 
  | 'api services' 
  | 'custom';