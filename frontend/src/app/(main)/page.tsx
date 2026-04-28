"use client";

import { Header, HeroBanner } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";

export default function AppPage() {
  const { isConnected, user } = useUserStore();

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-8 pb-16 pt-3">
        <HeroBanner />
        
        <div className="rounded-none border border-border-main bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-main">Your Personal AI Agent</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Connect your Locus Wallet and let your AI agent autonomously buy and sell services on the marketplace.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="/marketplace" className="inline-flex cursor-pointer rounded-none bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              Browse Services
            </a>
            <a href="/dashboard" className="inline-flex cursor-pointer rounded-none border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-main hover:border-brand">
              Agent Dashboard
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-none border border-border-main bg-surface p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-none bg-brand-light">
              <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-main">1. Connect Wallet</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Connect your Locus Wallet to create your personal AI agent
            </p>
          </div>

          <div className="rounded-none border border-border-main bg-surface p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-none bg-brand-light">
              <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-main">2. Set Preferences</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Define your budget, interests, and auto-buy rules
            </p>
          </div>

          <div className="rounded-none border border-border-main bg-surface p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-none bg-brand-light">
              <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-main">3. Let Agent Work</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Your agent autonomously buys and sells services for you
            </p>
          </div>
        </div>

        {isConnected && user && (
          <div className="rounded-none border border-green-200 bg-green-50 p-6">
            <p className="font-semibold text-green-700">
              Wallet Connected: {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
            </p>
            <p className="mt-1 text-sm text-green-600">
              Your personal AI agent is ready to work for you
            </p>
          </div>
        )}
      </main>
    </div>
  );
}