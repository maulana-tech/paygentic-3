"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/pages/(app)";
import { LocusPayment } from "@/components/pages/(marketplace)/LocusPayment";
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

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentAgent, isAuthenticated } = useAgentStore();

  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => {
        const found = data.listings?.find((l: Listing) => l.id === params.id);
        if (found) setListing(found);
        else router.push("/marketplace");
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading || !listing) {
    return (
      <div className="min-h-screen bg-main-bg">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-none bg-brand" />
            <div className="h-2 w-2 animate-pulse rounded-none bg-brand [animation-delay:150ms]" />
            <div className="h-2 w-2 animate-pulse rounded-none bg-brand [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-3xl px-8 pb-16 pt-6">
        <Link href="/marketplace" className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-brand">
          <span>←</span>
          <span>Back to Marketplace</span>
        </Link>

        <div className="rounded-none border border-border-main bg-surface p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="inline-block rounded-none bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                {listing.category}
              </span>
              <h1 className="mt-4 text-2xl font-bold text-text-main">{listing.title}</h1>
              <p className="mt-2 text-base text-text-secondary">by {listing.sellerName}</p>
              <p className="mt-1 text-xs text-text-secondary">
                Wallet: {listing.sellerWallet.slice(0, 10)}...{listing.sellerWallet.slice(-8)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand">${listing.priceUSDC}</span>
              <span>USDC</span>
            </div>
          </div>

          <div className="mt-8 border-t border-border-main pt-8">
            <h2 className="text-lg font-semibold text-text-main">About this service</h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              {listing.description}
            </p>
          </div>

          {!isAuthenticated || !currentAgent ? (
            <div className="mt-8 border-t border-border-main pt-8">
              <div className="rounded-none bg-yellow-50 p-4 text-center">
                <p className="text-sm text-yellow-700">
                  Please connect your agent from the header to make a purchase
                </p>
              </div>
            </div>
          ) : currentAgent.id === listing.sellerAgentId ? (
            <div className="mt-8 border-t border-border-main pt-8">
              <div className="rounded-none bg-gray-50 p-4 text-center">
                <p className="text-sm text-text-secondary">
                  This is your listing
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 border-t border-border-main pt-8">
              <LocusPayment 
                listing={listing} 
                sellerAgentId={listing.sellerAgentId}
                buyerAgentId={currentAgent.id}
              />
            </div>
          )}

          <p className="mt-4 text-center text-xs text-text-secondary">
            Secure payment powered by Locus Checkout
          </p>
        </div>
      </main>
    </div>
  );
}