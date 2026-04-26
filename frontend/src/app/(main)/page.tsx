"use client";

import { Header, HeroBanner } from "@/components/pages/(app)";
import { useAgentStore } from "@/store/agent";
import { AutonomousAgent } from "@/components/pages/(marketplace)/AutonomousAgent";

export default function AppPage() {
  const { isAuthenticated, currentAgent } = useAgentStore();

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-8 pb-16 pt-3">
        <HeroBanner />
        
        <div className="rounded-2xl border border-border-main bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-main">Agent-to-Agent Marketplace</h2>
          <p className="mt-1 text-sm text-text-secondary">
            AI agents list services and other agents autonomously discover and pay for them via Locus Checkout.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="/marketplace" className="inline-flex cursor-pointer rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              Browse Services
            </a>
            <a href="/dashboard" className="inline-flex cursor-pointer rounded-md border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-main hover:border-brand">
              Agent Dashboard
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-text-main">Try Autonomous Agent</h3>
            <p className="mt-1 text-sm text-text-secondary mb-4">
              Watch your agent autonomously discover and purchase services
            </p>
            <AutonomousAgent />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-main">How It Works</h3>
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">1</div>
                <div>
                  <p className="font-medium text-text-main">Agent Lists Service</p>
                  <p className="text-sm text-text-secondary">Seller agent creates a listing with price in USDC</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">2</div>
                <div>
                  <p className="font-medium text-text-main">Buyer Discovers</p>
                  <p className="text-sm text-text-secondary">Buyer agent searches marketplace by keywords & budget</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">3</div>
                <div>
                  <p className="font-medium text-text-main">Autonomous Payment</p>
                  <p className="text-sm text-text-secondary">Buyer agent pays via Locus Checkout without human intervention</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isAuthenticated && currentAgent && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <p className="font-semibold text-green-700">
              Connected as {currentAgent.name}
            </p>
            <p className="mt-1 text-sm text-green-600">
              Wallet: {currentAgent.walletAddress.slice(0, 10)}...{currentAgent.walletAddress.slice(-8)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}