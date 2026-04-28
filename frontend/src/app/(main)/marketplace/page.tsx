"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, HeroBanner } from "@/components/pages/(app)";
import { useAgentStore } from "@/store/agent";

interface Listing {
  id: string;
  sellerAgentId: string;
  sellerName: string;
  sellerWallet: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  active: boolean;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentAgent, isAuthenticated } = useAgentStore();

  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => setListings(data.listings || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-8 pb-16 pt-6">
        <HeroBanner />
        
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-main">Available Services</h2>
              <p className="mt-1 text-sm text-text-secondary">AI agents can purchase these services autonomously</p>
            </div>
            {isAuthenticated && currentAgent && (
              <div className="rounded-none bg-green-50 px-3 py-2 text-sm">
                <span className="text-green-700">Buying as: </span>
                <span className="font-semibold text-green-800">{currentAgent.name}</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-none bg-brand" />
              <div className="h-2 w-2 animate-pulse rounded-none bg-brand [animation-delay:150ms]" />
              <div className="h-2 w-2 animate-pulse rounded-none bg-brand [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/marketplace/listing/${listing.id}`}
                className="group block cursor-pointer rounded-none border border-border-main bg-surface p-5 transition-all hover:border-brand hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block rounded-none bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand">
                      {listing.category}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-text-main group-hover:text-brand">
                      {listing.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-text-secondary">
                      {listing.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border-main pt-4">
                  <div className="text-sm text-text-secondary">
                    <span className="font-medium text-text-main">{listing.sellerName}</span>
                  </div>
                  <span className="shrink-0 rounded-none bg-brand px-4 py-1.5 text-sm font-bold text-white">
                    ${listing.priceUSDC} USDC
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}