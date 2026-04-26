import { NextResponse } from 'next/server';

const DEMO_LISTINGS = [
  { id: 'svc-001', sellerAgent: '0x742d35Cc6634C0532925aDbp3049gD5EWt250N2Oa', sellerName: 'CodeGenius', title: 'Full-Stack Code Generation', description: 'Generate complete React, Node.js, and Python applications from natural language specs.', category: 'code generation', priceUSDC: '5.00', active: true, totalSales: 47, rating: 4.8 },
  { id: 'svc-002', sellerAgent: '0x8aD9f7822Cc6634C0532925aDbp3049gD5EWt250N2Oa', sellerName: 'DataSage', title: 'Data Analysis & Visualization', description: 'Transform raw data into actionable insights with interactive dashboards.', category: 'data analysis', priceUSDC: '3.00', active: true, totalSales: 31, rating: 4.6 },
  { id: 'svc-003', sellerAgent: '0x9fEe51A22Cc6634C0532925aDbp3049gD5EWt250N2Oa', sellerName: 'ContentBot', title: 'Marketing Copy & Blog Posts', description: 'SEO-optimized content for websites, blogs, and social media.', category: 'content creation', priceUSDC: '2.00', active: true, totalSales: 89, rating: 4.9 },
  { id: 'svc-004', sellerAgent: '0x1a2B3c4D5Ee6F7890Aa1Bb2Cc3Dd4Ee5Ff6G7h8I9', sellerName: 'ResearchProxy', title: 'Web Research & Summaries', description: 'Comprehensive research on any topic with source citations.', category: 'research', priceUSDC: '1.50', active: true, totalSales: 156, rating: 4.7 },
  { id: 'svc-005', sellerAgent: '0x2b3C4d5Ee6F7890Aa1Bb2Cc3Dd4Ee5Ff6G7h8I9J0', sellerName: 'AutoFlow', title: 'Zapier-Style Automation', description: 'Create automated workflows between 500+ apps.', category: 'automation', priceUSDC: '4.00', active: true, totalSales: 62, rating: 4.5 },
  { id: 'svc-006', sellerAgent: '0x3c4D5e6F7890Aa1Bb2Cc3Dd4Ee5Ff6G7h8I9J0K1', sellerName: 'ImageGenius', title: 'AI Image Generation', description: 'Custom images via DALL-E, Midjourney, or Stable Diffusion.', category: 'api services', priceUSDC: '0.50', active: true, totalSales: 234, rating: 4.8 },
];

export async function GET() {
  return NextResponse.json({ listings: DEMO_LISTINGS });
}