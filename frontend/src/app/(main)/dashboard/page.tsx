"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { StatsPanel } from "@/components/pages/(app)/stats-panel";
import { PreferencesPanel } from "@/components/pages/(app)/preferences-panel";
import { ActivityLogPanel } from "@/components/pages/(app)/activity-log";
import { getListingsByUser, getPurchasesByUser, Listing, Purchase, getAgentById } from "@/data/store";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isConnected, preferences } = useUserStore();
  const [activeTab, setActiveTab] = useState<'purchases' | 'listings'>('purchases');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const listings = getListingsByUser(user!.id);
    const purchases = getPurchasesByUser(user!.id);
    setMyListings(listings);
    setMyPurchases(purchases);
  }, [user, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-main-bg">
        <Header />
        <main className="mx-auto max-w-6xl px-8 pb-16 pt-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-light">
              <svg className="h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-main">Connect Your Wallet</h1>
            <p className="mt-2 text-text-secondary">
              Connect your Locus Wallet to access your agent dashboard
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              Use the "Connect Locus Wallet" button in the header
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-8 pb-16 pt-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main">Your Agent Dashboard</h1>
          <p className="mt-1 text-text-secondary">Manage your AI agent and marketplace activity</p>
        </div>

        {/* Stats Panel */}
        <div className="mb-8">
          <StatsPanel />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Preferences */}
          <div className="lg:col-span-1">
            <PreferencesPanel />
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-2">
            <ActivityLogPanel maxItems={20} showFilters={true} />
          </div>
        </div>

        {/* Services Tabs */}
        <div className="mt-8">
          <div className="flex items-center gap-4 border-b border-border-main">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'purchases'
                  ? "border-brand text-brand"
                  : "border-transparent text-text-secondary hover:text-text-main"
              }`}
            >
              My Purchases ({myPurchases.length})
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'listings'
                  ? "border-brand text-brand"
                  : "border-transparent text-text-secondary hover:text-text-main"
              }`}
            >
              My Listings ({myListings.length})
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'purchases' ? (
              myPurchases.length === 0 ? (
                <div className="rounded-lg border border-border-main bg-surface p-8 text-center">
                  <p className="text-text-secondary">No purchases yet</p>
                  <Link
                    href="/marketplace"
                    className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPurchases.map((purchase) => {
                    const seller = getAgentById(purchase.sellerAgentId);
                    return (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between rounded-lg border border-border-main bg-surface p-4"
                      >
                        <div>
                          <p className="font-medium text-text-main">Purchase #{purchase.id}</p>
                          <p className="text-sm text-text-secondary">
                            Seller: {seller?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-brand">${purchase.amount}</p>
                          <p className={`text-xs ${
                            purchase.status === 'CONFIRMED' ? 'text-green-600' :
                            purchase.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {purchase.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : myListings.length === 0 ? (
              <div className="rounded-lg border border-border-main bg-surface p-8 text-center">
                <p className="text-text-secondary">No listings yet</p>
                <Link
                  href="/dashboard/listing/new"
                  className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
                >
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between rounded-lg border border-border-main bg-surface p-4"
                  >
                    <div>
                      <p className="font-medium text-text-main">{listing.title}</p>
                      <p className="text-sm text-text-secondary">{listing.description.slice(0, 60)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-brand">${listing.priceUSDC}</p>
                      <p className="text-xs text-text-secondary">
                        {listing.active ? 'Active' : 'Inactive'} · {listing.totalSales} sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}