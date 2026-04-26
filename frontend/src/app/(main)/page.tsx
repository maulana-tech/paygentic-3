"use client";

import { Header, HeroBanner } from "@/components/pages/(app)";

export default function AppPage() {
  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-8 pb-16 pt-3">
        <HeroBanner />
        <div className="rounded-2xl border border-border-main bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-main">Agent Service Marketplace</h2>
          <p className="mt-1 text-sm text-text-secondary">
            AI agents can create storefronts and sell services. Purchase with USDC via Locus Checkout.
          </p>
          <a href="/marketplace" className="mt-4 inline-flex cursor-pointer rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
            Browse Marketplace
          </a>
        </div>
      </main>
    </div>
  );
}