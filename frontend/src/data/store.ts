export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  locusAccountId?: string;
  createdAt: string;
}

export interface Preferences {
  maxPurchaseBudget: string;
  monthlyBudget: string;
  interests: string[];
  autoBuyEnabled: boolean;
  autoBuyThreshold: string;
  autoListEnabled: boolean;
  autoListMinPrice: string;
  maxConcurrentTasks: number;
  responseTimePreference: 'fast' | 'balanced' | 'thorough';
}

export interface AgentStats {
  totalSpent: string;
  totalEarned: string;
  purchasesCount: number;
  salesCount: number;
}

export interface Agent {
  id: string;
  name: string;
  walletAddress: string;
  locusMerchantId?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  agentId?: string; // For backward compatibility with seller agents
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  active: boolean;
  totalSales: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  listingId: string;
  sellerAgentId: string;
  buyerUserId: string;
  transactionId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  amount: string;
  autoPurchased: boolean;
  createdAt: string;
}

export type PurchaseStatus = Purchase['status'];

export type LogType = 'PURCHASE' | 'SALE' | 'LISTING_CREATED' | 'LISTING_UPDATED' | 'ERROR' | 'INFO' | 'OFFER_MADE' | 'OFFER_ACCEPTED' | 'OFFER_DECLINED' | 'COUNTER_OFFER' | 'REVIEW_SUBMITTED' | 'SUBSCRIPTION_CREATED';

export interface ActivityLog {
  id: string;
  userId: string;
  type: LogType;
  message: string;
  details?: Record<string, string>;
  createdAt: string;
}

export const defaultPreferences: Preferences = {
  maxPurchaseBudget: '1',
  monthlyBudget: '10',
  interests: ['code generation', 'data analysis', 'automation'],
  autoBuyEnabled: false,
  autoBuyThreshold: '0.5',
  autoListEnabled: false,
  autoListMinPrice: '0.05',
  maxConcurrentTasks: 3,
  responseTimePreference: 'balanced',
};

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

export const listings: (Listing & { sellerName?: string })[] = [
  {
    id: 'svc-001',
    userId: 'agent-001',
    agentId: 'agent-001',
    title: 'Full-Stack Code Generation',
    description: 'Generate complete React, Node.js, and Python applications from natural language specs.',
    category: 'code generation',
    priceUSDC: '0.10',
    active: true,
    totalSales: 47,
    createdAt: '2024-01-15T10:00:00Z',
    sellerName: 'CodeGenius'
  },
  {
    id: 'svc-002',
    userId: 'agent-002',
    agentId: 'agent-002',
    title: 'Data Analysis & Visualization',
    description: 'Transform raw data into actionable insights with interactive dashboards.',
    category: 'data analysis',
    priceUSDC: '0.15',
    active: true,
    totalSales: 31,
    createdAt: '2024-01-16T10:00:00Z',
    sellerName: 'DataSage'
  },
  {
    id: 'svc-003',
    userId: 'agent-003',
    agentId: 'agent-003',
    title: 'Marketing Copy & Blog Posts',
    description: 'SEO-optimized content for websites, blogs, and social media.',
    category: 'content creation',
    priceUSDC: '0.05',
    active: true,
    totalSales: 89,
    createdAt: '2024-01-17T10:00:00Z',
    sellerName: 'ContentBot'
  },
  {
    id: 'svc-004',
    userId: 'agent-004',
    agentId: 'agent-004',
    title: 'Web Research & Summaries',
    description: 'Comprehensive research on any topic with source citations.',
    category: 'research',
    priceUSDC: '0.08',
    active: true,
    totalSales: 156,
    createdAt: '2024-01-18T10:00:00Z',
    sellerName: 'ResearchProxy'
  },
  {
    id: 'svc-005',
    userId: 'agent-005',
    agentId: 'agent-005',
    title: 'Zapier-Style Automation',
    description: 'Create automated workflows between 500+ apps.',
    category: 'automation',
    priceUSDC: '0.20',
    active: true,
    totalSales: 62,
    createdAt: '2024-01-19T10:00:00Z',
    sellerName: 'AutoFlow'
  },
  {
    id: 'svc-006',
    userId: 'agent-006',
    agentId: 'agent-006',
    title: 'AI Image Generation',
    description: 'Custom images via DALL-E, Midjourney, or Stable Diffusion.',
    category: 'api services',
    priceUSDC: '0.05',
    active: true,
    totalSales: 234,
    createdAt: '2024-01-20T10:00:00Z',
    sellerName: 'ImageGenius'
  },
  {
    id: 'svc-007',
    userId: 'agent-001',
    agentId: 'agent-001',
    title: 'API Design & Documentation',
    description: 'REST/GraphQL API design with OpenAPI specs and Postman collections.',
    category: 'code generation',
    priceUSDC: '0.30',
    active: true,
    totalSales: 28,
    createdAt: '2024-01-21T10:00:00Z',
    sellerName: 'CodeGenius'
  },
  {
    id: 'svc-008',
    userId: 'agent-002',
    agentId: 'agent-002',
    title: 'SQL Query Optimization',
    description: 'Analyze and optimize slow database queries for better performance.',
    category: 'data analysis',
    priceUSDC: '0.25',
    active: true,
    totalSales: 45,
    createdAt: '2024-01-22T10:00:00Z',
    sellerName: 'DataSage'
  },
  {
    id: 'svc-009',
    userId: 'agent-003',
    agentId: 'agent-003',
    title: 'Social Media Management',
    description: 'Schedule, post, and analyze content across all social platforms.',
    category: 'content creation',
    priceUSDC: '0.40',
    active: true,
    totalSales: 67,
    createdAt: '2024-01-23T10:00:00Z',
    sellerName: 'ContentBot'
  },
  {
    id: 'svc-010',
    userId: 'agent-004',
    agentId: 'agent-004',
    title: 'Competitive Analysis',
    description: 'Deep-dive analysis of competitors, market position, and opportunities.',
    category: 'research',
    priceUSDC: '0.35',
    active: true,
    totalSales: 93,
    createdAt: '2024-01-24T10:00:00Z',
    sellerName: 'ResearchProxy'
  },
  {
    id: 'svc-011',
    userId: 'agent-005',
    agentId: 'agent-005',
    title: 'Email Automation Sequences',
    description: 'Automated email drip campaigns for onboarding, sales, and retention.',
    category: 'automation',
    priceUSDC: '0.28',
    active: true,
    totalSales: 112,
    createdAt: '2024-01-25T10:00:00Z',
    sellerName: 'AutoFlow'
  },
  {
    id: 'svc-012',
    userId: 'agent-006',
    agentId: 'agent-006',
    title: 'Video Script Writing',
    description: 'Engaging video scripts for YouTube,TikTok, and promotional videos.',
    category: 'content creation',
    priceUSDC: '0.12',
    active: true,
    totalSales: 78,
    createdAt: '2024-01-26T10:00:00Z',
    sellerName: 'ImageGenius'
  },
  {
    id: 'svc-013',
    userId: 'agent-001',
    agentId: 'agent-001',
    title: 'Unit Test Generation',
    description: 'Comprehensive unit tests for React, Node.js, and Python with 90%+ coverage.',
    category: 'code generation',
    priceUSDC: '0.15',
    active: true,
    totalSales: 56,
    createdAt: '2024-01-27T10:00:00Z',
    sellerName: 'CodeGenius'
  },
  {
    id: 'svc-014',
    userId: 'agent-002',
    agentId: 'agent-002',
    title: 'Business Intelligence Dashboards',
    description: 'Real-time BI dashboards with Power BI, Tableau, or Looker.',
    category: 'data analysis',
    priceUSDC: '0.50',
    active: true,
    totalSales: 34,
    createdAt: '2024-01-28T10:00:00Z',
    sellerName: 'DataSage'
  },
  {
    id: 'svc-015',
    userId: 'agent-004',
    agentId: 'agent-004',
    title: 'Technical Documentation',
    description: 'Confluence-style docs, README files, and API reference documentation.',
    category: 'research',
    priceUSDC: '0.18',
    active: true,
    totalSales: 89,
    createdAt: '2024-01-29T10:00:00Z',
    sellerName: 'ResearchProxy'
  },
  {
    id: 'svc-016',
    userId: 'agent-005',
    agentId: 'agent-005',
    title: 'CRM Integration Setup',
    description: 'Connect and sync data between HubSpot, Salesforce, and other CRMs.',
    category: 'automation',
    priceUSDC: '0.45',
    active: true,
    totalSales: 41,
    createdAt: '2024-01-30T10:00:00Z',
    sellerName: 'AutoFlow'
  },
  {
    id: 'svc-017',
    userId: 'agent-003',
    agentId: 'agent-003',
    title: 'SEO Audit & Recommendations',
    description: 'Complete SEO analysis with keyword research and action plan.',
    category: 'content creation',
    priceUSDC: '0.22',
    active: true,
    totalSales: 145,
    createdAt: '2024-01-31T10:00:00Z',
    sellerName: 'ContentBot'
  },
  {
    id: 'svc-018',
    userId: 'agent-001',
    agentId: 'agent-001',
    title: 'Database Schema Design',
    description: 'Relational and NoSQL database schema design with migrations.',
    category: 'code generation',
    priceUSDC: '0.38',
    active: true,
    totalSales: 63,
    createdAt: '2024-02-01T10:00:00Z',
    sellerName: 'CodeGenius'
  }
];

export const purchases: Purchase[] = [];
export const users: User[] = [];
export const activityLogs: ActivityLog[] = [];

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getUserByWallet(address: string): User | undefined {
  return users.find(u => u.walletAddress.toLowerCase() === address.toLowerCase());
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getAgentByWallet(address: string): Agent | undefined {
  return agents.find(a => a.walletAddress.toLowerCase() === address.toLowerCase());
}

export function getListingsByUser(userId: string): (Listing & { sellerName?: string })[] {
  return listings.filter(l => l.userId === userId);
}

export function getListingById(id: string): (Listing & { sellerName?: string }) | undefined {
  return listings.find(l => l.id === id);
}

export function getPurchasesByUser(userId: string): Purchase[] {
  return purchases.filter(p => p.buyerUserId === userId);
}

export function getPurchasesForUserListings(userId: string): Purchase[] {
  const userListings = getListingsByUser(userId);
  const userListingIds = new Set(userListings.map(l => l.id));
  return purchases.filter(p => userListingIds.has(p.listingId));
}

export function getActivityLogsByUser(userId: string): ActivityLog[] {
  return activityLogs.filter(l => l.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addActivityLog(userId: string, type: LogType, message: string, details?: Record<string, string>) {
  const log: ActivityLog = {
    id: `log_${crypto.randomUUID().slice(0, 8)}`,
    userId,
    type,
    message,
    details,
    createdAt: new Date().toISOString()
  };
  activityLogs.unshift(log);
  return log;
}

export function getUserStats(userId: string): AgentStats {
  const userPurchases = getPurchasesByUser(userId);
  const salesToUser = getPurchasesForUserListings(userId);
  
  const totalSpent = userPurchases
    .filter(p => p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
  const totalEarned = salesToUser
    .filter(p => p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  return {
    totalSpent: totalSpent.toFixed(2),
    totalEarned: totalEarned.toFixed(2),
    purchasesCount: userPurchases.filter(p => p.status === 'CONFIRMED').length,
    salesCount: salesToUser.filter(p => p.status === 'CONFIRMED').length
  };
}

export const CATEGORIES = [
  'code generation',
  'data analysis', 
  'content creation',
  'research',
  'automation',
  'api services',
  'custom',
  'video production',
  'analytics',
  'crm'
];

export interface Negotiation {
  id: string;
  listingId: string;
  buyerUserId: string;
  sellerAgentId: string;
  originalPrice: string;
  offeredPrice: string;
  status: 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'EXPIRED';
  buyerMessage?: string;
  sellerResponse?: string;
  counterPrice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  purchaseId: string;
  listingId: string;
  sellerAgentId: string;
  buyerUserId: string;
  rating: number;
  qualityScore: number;
  speedScore: number;
  commScore: number;
  comment?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  listingId: string;
  buyerUserId: string;
  sellerAgentId: string;
  planType: 'monthly' | 'annual';
  amount: string;
  originalPrice: string;
  nextBillingDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  transactionId?: string;
  createdAt: string;
}

export const negotiations: Negotiation[] = [];
export const reviews: Review[] = [];
export const subscriptions: Subscription[] = [];

export function createNegotiation(data: Omit<Negotiation, 'id' | 'createdAt' | 'updatedAt'>): Negotiation {
  const negotiation: Negotiation = {
    ...data,
    id: `neg_${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  negotiations.push(negotiation);
  return negotiation;
}

export function getNegotiationsByUser(userId: string): Negotiation[] {
  return negotiations.filter(n => n.buyerUserId === userId);
}

export function getNegotiationsForListing(listingId: string): Negotiation[] {
  return negotiations.filter(n => n.listingId === listingId && n.status === 'PENDING');
}

export function updateNegotiation(id: string, updates: Partial<Negotiation>): Negotiation | undefined {
  const index = negotiations.findIndex(n => n.id === id);
  if (index === -1) return undefined;
  negotiations[index] = { ...negotiations[index], ...updates, updatedAt: new Date().toISOString() };
  return negotiations[index];
}

export function getReviewsByAgent(agentId: string): Review[] {
  return reviews.filter(r => r.sellerAgentId === agentId);
}

export function getAgentRating(agentId: string): { avgRating: number; qualityAvg: number; speedAvg: number; commAvg: number; count: number } {
  const agentReviews = getReviewsByAgent(agentId);
  if (agentReviews.length === 0) return { avgRating: 0, qualityAvg: 0, speedAvg: 0, commAvg: 0, count: 0 };
  
  const avgRating = agentReviews.reduce((sum, r) => sum + r.rating, 0) / agentReviews.length;
  const qualityAvg = agentReviews.reduce((sum, r) => sum + r.qualityScore, 0) / agentReviews.length;
  const speedAvg = agentReviews.reduce((sum, r) => sum + r.speedScore, 0) / agentReviews.length;
  const commAvg = agentReviews.reduce((sum, r) => sum + r.commScore, 0) / agentReviews.length;
  
  return { 
    avgRating: Math.round(avgRating * 10) / 10, 
    qualityAvg: Math.round(qualityAvg * 10) / 10,
    speedAvg: Math.round(speedAvg * 10) / 10,
    commAvg: Math.round(commAvg * 10) / 10,
    count: agentReviews.length 
  };
}

export function createReview(data: Omit<Review, 'id' | 'createdAt'>): Review {
  const review: Review = {
    ...data,
    id: `rev_${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString()
  };
  reviews.push(review);
  return review;
}

export function getSubscriptionsByUser(userId: string): Subscription[] {
  return subscriptions.filter(s => s.buyerUserId === userId);
}

export function getActiveSubscriptionsByUser(userId: string): Subscription[] {
  return subscriptions.filter(s => s.buyerUserId === userId && s.status === 'ACTIVE');
}

export function createSubscription(data: Omit<Subscription, 'id' | 'createdAt' | 'nextBillingDate'>): Subscription {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const subscription: Subscription = {
    ...data,
    id: `sub_${crypto.randomUUID().slice(0, 8)}`,
    nextBillingDate: nextMonth.toISOString(),
    createdAt: new Date().toISOString()
  };
  subscriptions.push(subscription);
  return subscription;
}

export function updateSubscription(id: string, updates: Partial<Subscription>): Subscription | undefined {
  const index = subscriptions.findIndex(s => s.id === id);
  if (index === -1) return undefined;
  subscriptions[index] = { ...subscriptions[index], ...updates };
  return subscriptions[index];
}

export interface ServiceAccess {
  id: string;
  purchaseId: string;
  listingId: string;
  buyerUserId: string;
  sellerAgentId: string;
  accessToken: string;
  accessTokenCreated: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

export const serviceAccesses: ServiceAccess[] = [];

export function createServiceAccess(data: Omit<ServiceAccess, 'id' | 'accessToken' | 'accessTokenCreated' | 'expiresAt'>): ServiceAccess {
  const access: ServiceAccess = {
    ...data,
    id: `acc_${crypto.randomUUID().slice(0, 8)}`,
    accessToken: `cusygen_${data.listingId}_${crypto.randomUUID().slice(0, 12)}`,
    accessTokenCreated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    status: 'ACTIVE'
  };
  serviceAccesses.push(access);
  return access;
}

export function getServiceAccessByToken(token: string): ServiceAccess | undefined {
  return serviceAccesses.find(a => a.accessToken === token && a.status === 'ACTIVE');
}

export function getServiceAccessesByUser(userId: string): ServiceAccess[] {
  return serviceAccesses.filter(a => a.buyerUserId === userId);
}

export function revokeServiceAccess(id: string): boolean {
  const index = serviceAccesses.findIndex(a => a.id === id);
  if (index === -1) return false;
  serviceAccesses[index].status = 'REVOKED';
  return true;
}