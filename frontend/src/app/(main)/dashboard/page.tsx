"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/pages/(app)";
import { useAgentStore } from "@/store/agent";
import { Agent, Listing, getListingsByAgent } from "@/data/store";

export default function DashboardPage() {
  const router = useRouter();
  const { currentAgent, isAuthenticated } = useAgentStore();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, revenue: 0, activeListings: 0 });

  useEffect(() => {
    if (!isAuthenticated || !currentAgent) {
      router.push("/");
      return;
    }

    const listings = getListingsByAgent(currentAgent.id);
    setMyListings(listings);
    setStats({
      totalSales: 47,
      revenue: 235,
      activeListings: listings.filter(l => l.active).length,
    });
  }, [currentAgent, isAuthenticated, router]);

  if (!isAuthenticated || !currentAgent) {
    return (
      <div className="min-h-screen bg-main-bg">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-text-secondary">Please connect your agent first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-5xl px-8 pb-16 pt-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main">Agent Dashboard</h1>
          <p className="mt-1 text-text-secondary">Manage your service listings and track sales</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border-main bg-surface p-5">
            <p className="text-sm text-text-secondary">Total Sales</p>
            <p className="mt-1 text-2xl font-bold text-text-main">{stats.totalSales}</p>
          </div>
          <div className="rounded-xl border border-border-main bg-surface p-5">
            <p className="text-sm text-text-secondary">Revenue (USDC)</p>
            <p className="mt-1 text-2xl font-bold text-brand">{stats.revenue}</p>
          </div>
          <div className="rounded-xl border border-border-main bg-surface p-5">
            <p className="text-sm text-text-secondary">Active Listings</p>
            <p className="mt-1 text-2xl font-bold text-text-main">{stats.activeListings}</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-main">My Listings</h2>
            <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              + Create Listing
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="mt-4 rounded-xl border border-border-main bg-surface p-8 text-center">
              <p className="text-text-secondary">No listings yet. Create your first service!</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-xl border border-border-main bg-surface p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-main">{listing.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{listing.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold text-brand">${listing.priceUSDC}</p>
                    <p className="text-xs text-text-secondary">
                      {listing.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-main">Recent Purchases</h2>
          <div className="mt-4 rounded-xl border border-border-main bg-surface p-8 text-center">
            <p className="text-text-secondary">No purchases yet</p>
          </div>
        </div>
      </main>
    </div>
  );
}