"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { StatsPanel } from "@/components/pages/(app)/stats-panel";
import { PreferencesPanel } from "@/components/pages/(app)/preferences-panel";
import { ActivityLogPanel } from "@/components/pages/(app)/activity-log";
import { getListingsByUser, getPurchasesByUser, Listing, Purchase, getAgentById, getSubscriptionsByUser } from "@/data/store";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isConnected, preferences } = useUserStore();
  const [activeTab, setActiveTab] = useState<'purchases' | 'listings' | 'subscriptions'>('purchases');
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
        <main className="mx-auto max-w-4xl px-8 pb-16 pt-12">
          <div className="rounded-2xl border border-border-main bg-surface p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-light">
              <svg className="h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-main">Connect Your Wallet</h1>
            <p className="mt-2 text-text-secondary max-w-md mx-auto">
              Connect your Locus Wallet to access your agent dashboard and start buying or selling AI services
            </p>
            <div className="mt-6 text-sm text-text-secondary">
              Use the "Connect Locus Wallet" button in the header above
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-8 pb-16 pt-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-main">Dashboard</h1>
              <p className="mt-1 text-text-secondary">Manage your AI agent and marketplace activity</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/marketplace"
                className="rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 transition-colors"
              >
                Browse Services
              </Link>
              <Link
                href="/dashboard/listing/new"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
              >
                + Create Listing
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="mb-6">
          <StatsPanel />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Preferences */}
          <div className="lg:col-span-1 space-y-6">
            <PreferencesPanel />
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-2">
            <ActivityLogPanel maxItems={15} showFilters={true} />
          </div>
        </div>

        {/* Services Tabs */}
        <div className="mt-8">
          <div className="rounded-t-2xl border border-border-main border-b-0 bg-surface">
            <div className="flex items-center gap-1 px-4">
              <button
                onClick={() => setActiveTab('purchases')}
                className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'purchases'
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-main"
                }`}
              >
                Purchases
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{myPurchases.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'listings'
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-main"
                }`}
              >
                My Listings
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{myListings.length}</span>
              </button>
            </div>
          </div>

          <div className="rounded-b-2xl rounded-t-none border border-border-main bg-surface p-6">
            {activeTab === 'purchases' ? (
              myPurchases.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-text-secondary mb-4">You haven't purchased any services yet</p>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
                  >
                    <span>Browse Marketplace</span>
                    <span>→</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPurchases.map((purchase) => {
                    const seller = getAgentById(purchase.sellerAgentId);
                    return (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between rounded-xl border border-border-main bg-gray-50/50 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                            <span className="text-sm font-bold text-brand">${purchase.amount}</span>
                          </div>
                          <div>
                            <p className="font-medium text-text-main">Purchase #{purchase.id.slice(-6)}</p>
                            <p className="text-sm text-text-secondary">
                              from {seller?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            purchase.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-700' 
                              : purchase.status === 'FAILED' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {purchase.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : myListings.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-text-secondary mb-4">Start earning by creating your first listing</p>
                <Link
                  href="/dashboard/listing/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
                >
                  <span>Create Listing</span>
                  <span>+</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between rounded-xl border border-border-main bg-gray-50/50 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                        <span className="text-sm font-bold text-brand">${listing.priceUSDC}</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-main">{listing.title}</p>
                        <p className="text-sm text-text-secondary">{listing.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        listing.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-text-secondary">{listing.totalSales} sales</span>
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